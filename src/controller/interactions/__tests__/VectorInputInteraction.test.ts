import { Vector } from "../../../model/Vector";
import { ViewportMode } from "../../../model/ViewportMode";
import { VectorInteraction } from "../VectorInteraction"


test('initially interaction is not finished', () => {
    const interaction = new VectorInteraction()
    expect(interaction.finished).toBe(false)
})

test('after first pointer click interaction is not finished', () => {
    const interaction = new VectorInteraction()
    interaction.set_pointer_world_location(new Vector(10, 10, 10))
    interaction.pointer_click()
    expect(interaction.finished).toBe(false)
})

test('before first click result equals zero vector', () => {
    const interaction = new VectorInteraction()
    interaction.set_pointer_world_location(new Vector(10, 10, 10))
    interaction.set_pointer_world_location(new Vector(14, 14, 14))
    expect(interaction.result).toEqual(Vector.ZERO)
})

test('after first click result starts having a vector', () => {
    const interaction = new VectorInteraction()
    interaction.set_pointer_world_location(new Vector(10, 10, 10))
    interaction.pointer_click()
    interaction.set_pointer_world_location(new Vector(11, 12, 13))
    expect(interaction.result).toEqual(new Vector(1, 2, 3))
})

test('after second click interaction is finished and has correct result', () => {
    const interaction = new VectorInteraction()
    interaction.set_pointer_world_location(new Vector(10, 10, 10))
    interaction.pointer_click()
    interaction.set_pointer_world_location(new Vector(11, 12, 13))
    interaction.pointer_click()
    expect(interaction.finished).toBe(true)
    expect(interaction.result).toEqual(new Vector(1, 2, 3))
})

const viewmode_cases: Array<[ViewportMode, Vector]> = [
    [ViewportMode.Top, new Vector(1, 1, 0)],
    [ViewportMode.Side, new Vector(1, 0, 1)],
    [ViewportMode.Front, new Vector(0, 1, 1)],
    [ViewportMode.Perspective, new Vector(1, 1, 1)],
]

viewmode_cases.forEach(([mode, vector]) =>
    test(`interaction in view mode ${mode} results in ${JSON.stringify(vector)}`, () => {
        const interaction = new VectorInteraction()
        interaction.set_pointer_world_location(new Vector(10, 10, 10), mode)
        interaction.pointer_click()
        interaction.set_pointer_world_location(new Vector(11, 11, 11), mode)
        interaction.pointer_click()
        expect(interaction.result).toEqual(vector);
    })
)