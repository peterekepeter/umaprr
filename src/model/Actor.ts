import { Vector } from "./Vector";
import { BrushModel } from "./BrushModel";
import { CsgOperation } from "./CsgOperation";

export class Actor
{
    public name : string = "Actor0";
    public className : string = "Actor";
    public location : Vector = Vector.zero;
    public oldLocation : Vector = Vector.zero;
    public group : string[] = [];
    public brushModel: BrushModel | null = null;
    public csgOperation: CsgOperation | null = null;
    
    // additional unsupported props go here, these still need to be reencoded
    public unsupportedProperties : { [key:string] : string | object } = {};
}