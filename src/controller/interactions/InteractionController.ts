import { toggle_box_select_command } from "../../commands/editor/toggle_box_select"
import { make_actor_selection_command } from "../../commands/selection/make_actor_selection"
import { replace_selection_command } from "../../commands/selection/replace_selection"
import { select_toggle_vertex_command } from "../../commands/selection/select_toggle_vertex"
import { select_vertex_command } from "../../commands/selection/select_vertex"
import { toggle_actor_selected_command } from "../../commands/selection/toggle_actor_selected"
import { toggle_selection_command } from "../../commands/selection/toggle_selection"
import { BoundingBox } from "../../model/BoundingBox"
import { create_actor_selection, DEFAULT_ACTOR_SELECTION, DEFAULT_EDITOR_SELECTION, EditorSelection } from "../../model/EditorSelection"
import { GeometryCache } from "../../model/geometry/GeometryCache"
import { Vector } from "../../model/Vector"
import { ViewportEvent } from "../../model/ViewportEvent"
import { ViewportQueries } from "../../render/ViewportQueries"
import { AppController } from "../AppController"
import { ICommandInfoV2 } from "../command"
import { Interaction } from "./Interaction"
import { InteractionRenderState } from "./InteractionRenderState"

export class InteractionController {

    command_info: ICommandInfoV2;
    args: unknown[];
    arg_index = 0;
    interaction: Interaction;
    box_begin_x: number = null;
    box_begin_y: number = null;

    private _interaction_geometry_cache = new GeometryCache()
    private _viewport_queries = new ViewportQueries(this._interaction_geometry_cache);

    constructor(private controller: AppController) {

    }

    interactively_execute(command_info: ICommandInfoV2): void {
        this.command_info = command_info
        this.args = []
        this.args.length = command_info.args?.length ?? 0
        this.arg_index = 0
        this.try_complete_execution()
    }

    try_complete_execution(): void {
        if (!this.command_info) {
            return // no command to exec
        }
        if (this.interaction?.finished) {
            // finalize completed interaction
            this.args[this.arg_index] = this.interaction.result
            this.interaction = null
            this.arg_index += 1
        }
        if (this.arg_index >= this.args.length) {
            // execute the command
            this.controller.execute(this.command_info, ...this.args)
            this.command_info = null
            return
        }
        // need more args
        if (this.interaction == null) {
            const factory = this.command_info.args[this.arg_index].interaction_factory
            this.interaction = factory()
        }
    }

    pointer_up(event: ViewportEvent): void {
        if (!this.interaction) {
            // hardcoded interactions
            if (this.controller.current_state.options.box_select_mode) {
                this.box_selection(event, true)
            } else {
                this.point_selection(event)
            }
        } else {
            const [vector, is_snap] = this.get_viewport_event_world_position(event)
            this.interaction.set_pointer_world_location(vector, event)
            this.interaction.pointer_click()
            this.try_complete_execution()
        }
    }

    pointer_down(event: ViewportEvent): void {
        if (this.controller.current_state.options.box_select_mode) {
            this.interaction = null
            this.box_begin_x = event.canvas_x
            this.box_begin_y = event.canvas_y
        }
    }

    box_selection(event: ViewportEvent, final: boolean): void {

        const min_x = Math.min(event.canvas_x, this.box_begin_x)
        const min_y = Math.min(event.canvas_y, this.box_begin_y)
        const max_x = Math.max(event.canvas_x, this.box_begin_x)
        const max_y = Math.max(event.canvas_y, this.box_begin_y)
        const state = this.controller.state_signal.value
        this._interaction_geometry_cache.actors = state.map.actors
        this._viewport_queries.render_transform = event.view_transform

        const selection: EditorSelection = state.options.vertex_mode
            ? this._viewport_queries.find_vertexes_of_selected_actors_in_box(state, min_x, min_y, max_x, max_y, this._interaction_geometry_cache)
            : { actors: this._viewport_queries.find_actors_in_box(state.map, min_x, min_y, max_x, max_y).map(i => create_actor_selection(i)) }
        const command: ICommandInfoV2 = { exec: s=>({ ...s, selection }) }
        if (!final) {
            const interaction_render_state: InteractionRenderState = {
                viewport_box_index: event.viewport_index,
                viewport_box: new BoundingBox({ min_x, min_y, max_x, max_y }),
            }
            this.controller.preview_command_with_interaction(interaction_render_state, command, []) 
        } else {
            this.controller.execute(command)
            this.controller.execute(toggle_box_select_command, false)
            this.box_begin_x = null
            this.box_begin_y = null
        }
    }

    point_selection(event: ViewportEvent): void {
        const controller = this.controller
        const state = controller.state_signal.value
        const vertex_mode = state.options.vertex_mode
        this._interaction_geometry_cache.actors = state.map.actors
        this._viewport_queries.render_transform = event.view_transform
        if (vertex_mode) {
            this.point_select_in_vertex_mode(event)
        } else {
            const actor = this._viewport_queries.find_nearest_actor(state.map, event.canvas_x, event.canvas_y)
            if (event.ctrl_key) {
                controller.execute(toggle_actor_selected_command, actor)
            } else {
                controller.execute(make_actor_selection_command, actor)
            }
        }
    }

    point_select_in_vertex_mode(event: ViewportEvent): void {
        const controller = this.controller
        const state = controller.state_signal.value

        if (!state.options.vertex_mode){
            throw new Error("expected to only be called in vertex mode")
        }
        
        this._interaction_geometry_cache.actors = state.map.actors
        this._viewport_queries.render_transform = event.view_transform

        const MAX_DISTANCE = 16
        const [vertex_actor, vertex, vertex_distance] = 
            this._viewport_queries.find_nearest_vertex(state, event.canvas_x, event.canvas_y)
        const [edge_actor, edge, raw_edge_distance] = 
            this._viewport_queries.find_nearest_edge(state, event.canvas_x, event.canvas_y)
        
        const edge_distance = Math.max(raw_edge_distance, 16 - vertex_distance)

        let best_distance = Number.MAX_SAFE_INTEGER
        let selection: EditorSelection = DEFAULT_EDITOR_SELECTION

        if (vertex_distance < best_distance && vertex_distance < MAX_DISTANCE)
        {
            best_distance = vertex_distance
            selection = { actors: [{ ...DEFAULT_ACTOR_SELECTION, actor_index: vertex_actor, vertexes: [vertex] }] }
        }

        if (edge_distance < best_distance && edge_distance < MAX_DISTANCE)
        {
            best_distance = edge_distance
            selection = { actors: [{ ...DEFAULT_ACTOR_SELECTION, actor_index: edge_actor, edges: [edge] }] }
        }

        const command = event.ctrl_key 
            ? toggle_selection_command
            : replace_selection_command

        controller.execute(command, selection)
    }

    point_select_in_object_mode(event: ViewportEvent): void {
        const controller = this.controller
        const state = controller.state_signal.value

        if (state.options.vertex_mode){
            throw new Error("expected to never be called in vertex mode")
        }

        const actor = this._viewport_queries.find_nearest_actor(state.map, event.canvas_x, event.canvas_y)

        const command = event.ctrl_key 
            ? toggle_actor_selected_command
            : make_actor_selection_command
            
        controller.execute(command, actor)
    }

    pointer_move(event: ViewportEvent): void {
        if (this.interaction) {
            const [vector, is_snap] = this.get_viewport_event_world_position(event)
            this.interaction.set_pointer_world_location(vector, event)
            this.args[this.arg_index] = this.interaction.result
            const interaction_render_state: InteractionRenderState = {
                ...this.interaction.render_state,
                snap_location: is_snap ? vector : null,
            }

            this.controller.preview_command_with_interaction(interaction_render_state, this.command_info, this.args)
        }
        else if (this.controller.current_state.options.box_select_mode
            && this.box_begin_x !== null && this.box_begin_y !== null) {
            this.box_selection(event, false)
        }
    }

    get_viewport_event_world_position(event: ViewportEvent): [Vector, boolean] {

        const state = this.controller.current_state
        this._viewport_queries.render_transform = event.view_transform

        // interaction uses a custom geometry cache, so geometry queries are made against the same state
        // instead of making them with the preview state
        this._interaction_geometry_cache.actors = state.map.actors
        
        const [vector, distance]
            = this._viewport_queries.find_nearest_snapping_point(state.map, event.canvas_x, event.canvas_y, this._interaction_geometry_cache)
        if (vector && distance < 16) {
            return [vector, true]
        }
        return [event.view_transform.canvas_to_world_location(event.canvas_x, event.canvas_y), false]
    }

}
