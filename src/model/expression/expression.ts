import { Vector } from "../Vector";
import { split_tokens } from "./split_tokens";


export function vector_from_expression(original: string) : Vector {
    const whitespace_rule = /\s+/g;
    const number_rule = /[+-]?\d+/g;
    const no_whitespace = split_tokens([original], whitespace_rule, { discard: true });
    const tokens = split_tokens(no_whitespace, number_rule);

    let number = false;
    let number_value = 0;
    let x_value = 0;
    let y_value = 0;
    let z_value = 0;
    for (const token of tokens){
        if (number){
            switch (token){
                case 'x': x_value += number_value; break;
                case 'y': y_value += number_value; break;
                case 'z': z_value += number_value; break;
                default: throw new Error(
                    `invalid expression, expected xyz, found ${token} instead`
                )
            }
            number = false;
            number_value = 0;
        } else {
            if (!token.match(number_rule)){
                throw new Error(
                    `invalid expression, expected number, found ${token} instead`
                )
            }
            number = true;
            number_value = Number(token);
        }
    }
    return new Vector(x_value, y_value, z_value);
}
