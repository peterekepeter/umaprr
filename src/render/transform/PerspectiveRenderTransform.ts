
import { BoundingBox } from "../../model/BoundingBox"
import { Matrix3x3 } from "../../model/Matrix3x3"
import { Vector } from "../../model/Vector"
import { RenderTransform } from "../RenderTransform"


export class PerspectiveRenderTransform implements RenderTransform {

    width: number;
    height: number;
    deviceSize: number;
    scale: number;
    view_center: Vector;
    view_rotation: Matrix3x3;
    
    constructor(public field_of_view = 90){
    }

    get_view_bounding_box(): BoundingBox {
        const forward = this.view_rotation.apply(Vector.FORWARD)

        let max_squared = 0
        let axis = 0
        for (let i=0; i<3; i++){
            const component = forward.get_component(i)
            const squared = component * component
            if (squared > max_squared){
                max_squared = squared
                axis = i
            }
        }

        const negative = forward.get_component(axis) < 0

        switch (axis){
            case 0 :
                return negative 
                    ? new BoundingBox({ max_x: this.view_center.x })
                    : new BoundingBox({ min_x: this.view_center.x })
            case 1 :
                return negative 
                    ? new BoundingBox({ min_y: this.view_center.y })
                    : new BoundingBox({ max_y: this.view_center.y })
            case 2 :
                return negative 
                    ? new BoundingBox({ max_z: this.view_center.z })
                    : new BoundingBox({ min_z: this.view_center.z })
            default: 
                throw new Error('implementation error')
        }
    }

    get can_3d_transform(): boolean { return true }

    view_transform(vector: Vector): Vector {
        const x = vector.x - this.view_center.x
        const y = vector.y - this.view_center.y
        const z = vector.z - this.view_center.z
        return new Vector(
            this.view_rotation.getTransformedX(x, y, z),
            this.view_rotation.getTransformedY(x, y, z),
            this.view_rotation.getTransformedZ(x, y, z))
    }

    view_transform_x(v: Vector): number {
        const w_x = v.x - this.view_center.x
        const w_y = v.y - this.view_center.y
        const w_z = v.z - this.view_center.z
        const x = this.view_rotation.getTransformedX(w_x, w_y, w_z)
        const y = this.view_rotation.getTransformedY(w_x, w_y, w_z)
        return x < 0
            ? Number.NaN
            : (y / x) * this.deviceSize + this.width * .5
    }

    view_transform_y(v: Vector): number {
        const w_x = v.x - this.view_center.x
        const w_y = v.y - this.view_center.y
        const w_z = v.z - this.view_center.z
        const x = this.view_rotation.getTransformedX(w_x, w_y, w_z)
        const z = this.view_rotation.getTransformedZ(w_x, w_y, w_z)
        return x < 0
            ? Number.NaN
            : (-z / x) * this.deviceSize + this.height * .5
    }

    canvas_to_world_location(canvas_x: number, canvas_y: number): Vector {
        return Vector.ZERO
    }
}