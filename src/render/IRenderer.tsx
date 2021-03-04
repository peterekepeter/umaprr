import { UnrealMap } from "../model/UnrealMap";
import { Vector } from "../model/Vector";
import { Actor } from "../model/Actor";
import { Rotation } from "../model/Rotation";
import { EditorState } from "../model/EditorState";
import { GeometryCache } from "../model/geometry/GeometryCache";
import { ViewportMode } from "../model/ViewportMode";

export interface IRenderer {
    setShowVertexes(state: boolean) : void;
    setCenterTo(location : Vector) : void;
    setPerspectiveRotation(rotation : Rotation) : void;
    setPerspectiveMode(fieldOfView : number) : void;
    setTopMode(scale : number) : void;
    setFrontMode(scale : number) : void;
    setSideMode(scale : number) : void;
    get_view_mode() : ViewportMode;
    render (unrealMap : UnrealMap) : void;
    render_v2 (state : EditorState) : void;
    findNearestActor(map: UnrealMap, canvasX: number, canvasY: number) : Actor;
    findNearestVertex(map: UnrealMap, canvasX: number, canvasY: number): [Actor, number];
    find_nearest_snapping_point(map: UnrealMap,canvasX: number,canvasY: number, geometry_cache: GeometryCache): [Vector, number]
    get_pointer_world_location(canvas_x: number, canvas_y: number): Vector;
}