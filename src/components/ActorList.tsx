import React = require("react");
import { UnrealMap } from "../model/UnrealMap";
import { HoverEffect } from "../ui/HoverEffect";
import { UiText } from "../ui/UiText";
import { SectionTitle } from "../ui/SectionTitle";
import { createController } from "../controller";
import { Actor } from "../model/Actor";
import { themeColors } from "../theme";
import { useSignal } from "./useSignal";

export function ActorList({ controller = createController() }) {
    const map = controller.map.value;
    const colors = useSignal(themeColors);
    return <div style={{overflow:"hidden", display:'grid'}}>
        <SectionTitle>Actors</SectionTitle>
        <div style={{overflow:'auto'}}>
        {
            map.actors.map(actor => 
                <div key={actor.name} style={{
                    userSelect:'none', 
                    background:actor.selected ? colors.accent : null,
                    color:actor.selected ? colors.background : null 
                    }} onClick={event => handleClick(event, actor)}>
                    <HoverEffect>
                        <UiText>{actor.name}</UiText>
                    </HoverEffect>
                </div>
            )
        }
        </div>
    </div>;

    function handleClick(event: React.MouseEvent<HTMLElement>, actor : Actor){
        if (event.ctrlKey){
            controller.toggleSelection(actor);
        } else {
            controller.makeSelection(actor);
        }
    }
}
