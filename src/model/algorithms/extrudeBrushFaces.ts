import { BrushModel } from "../BrushModel";
import { Vector } from "../Vector";
import { createBrushPolygons } from "./createBrushPolygon";

export function extrudeBrushFaces(brush: BrushModel, facesIndices: number[], distance: number) : BrushModel {
    if (facesIndices.length == 0 || distance === 0) {
        return brush;
    }
    let new_brush = brush.shallowCopy();
    new_brush.vertexes = [...new_brush.vertexes];
    new_brush.polygons = [...new_brush.polygons];
    for (const faceIndex of facesIndices){
        new_brush = extrudeFaceDistance(new_brush, faceIndex, distance);
    }
    new_brush.buildAllPolygonEdges()
    return new_brush;
}

function extrudeFaceDistance(mutable_brush: BrushModel, face_index: number, extrude_distance: number) : BrushModel {
    const targetFace = mutable_brush.polygons[face_index];
    const normal = targetFace.normal;
    const extrude_vector = normal.scale(extrude_distance);
    return extrudeFaceVector(mutable_brush, face_index, extrude_vector);
}

function extrudeFaceVector(mutable_brush: BrushModel, face_index: number, extrude_vector: Vector) : BrushModel {
    const targetFace = mutable_brush.polygons[face_index];
    const replacementFace = targetFace.shallowCopy();
    replacementFace.vertexes = [];
    // add new vertexes
    for (const vertexIndex of targetFace.vertexes){
        const vertex = mutable_brush.vertexes[vertexIndex];
        const newVertexIndex = mutable_brush.addVertex(vertex.position.addVector(extrude_vector), true);
        replacementFace.vertexes.push(newVertexIndex);
    }
    // replace targetFace
    mutable_brush.polygons[face_index] = replacementFace;
    // deselect vertexes of targetFace
    for (const vertexIndex of targetFace.vertexes){
        const vertex = mutable_brush.vertexes[vertexIndex];
        if (vertex.selected){
            const new_vertex = vertex.shallowCopy();
            new_vertex.selected = false;
            mutable_brush.vertexes[vertexIndex] = new_vertex;
        }
    }
    return bridgeEdgeLoops(mutable_brush, targetFace.vertexes, replacementFace.vertexes);
}

function bridgeEdgeLoops(brush: BrushModel, first_loop_vertexes : number[], second_loop_vertexes: number[]) : BrushModel {
    if (first_loop_vertexes.length !== second_loop_vertexes.length){
        throw new Error('edge loops not compatible');
    }
    let polygons_to_create :number[][] = [];
    let last_index = first_loop_vertexes.length-1;
    for (let current_index=0 ;current_index<first_loop_vertexes.length; current_index++){
        polygons_to_create.push([
            first_loop_vertexes[current_index],
            second_loop_vertexes[current_index],
            second_loop_vertexes[last_index],
            first_loop_vertexes[last_index]
        ]);
        last_index= current_index;
    }
    return createBrushPolygons(brush, polygons_to_create);
}