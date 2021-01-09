import React = require("react");
import { createController } from "../controller";
import { useSignal } from "./useSignal";
import { ViewportMode } from "../model/ViewportMode";
import { Vector } from "../model/Vector";
import { ViewportPanel } from "./ViewportPanel";
import { themeColors } from "../theme";
import { ActorList } from "./ActorList";
import { PropertyEditor } from "./PropertyEditor";
import { CommandPalette } from "./CommandPalette";

export const Application = ({ controller = createController() }) => {
    return <>
        <MainGrid controller={controller}/>
        <CommandPalette controller={controller}/>
    </>
}

export const MainGrid = ({ controller = createController() }) => {

    const colors = useSignal(themeColors);
    const [resizeCount, setResizeCount] = React.useState(0);

    React.useEffect(() => {
        let timeout : any = null;
        const handler = (event : UIEvent) => {
            if (timeout != null){
                clearTimeout(timeout);
            }
            // force layout recalc with 100ms debounce
            timeout = setTimeout(() => setResizeCount(resizeCount + 1), 100);
            
        };
        window.addEventListener('resize', handler);
        return () => {
            if (timeout){
                clearTimeout(timeout);
                timeout = null;
            }
            window.removeEventListener('resize', handler);
        }
    })

    return <div style={{
        display:'grid', 
        grid: '1fr 1fr / 0.5fr 1.5fr 1fr', 
        overflow: 'hidden',
        background:colors.background, 
        color:colors.foreground,
        width:'100%',
        height:'100%'}}>


        <ActorList controller={controller}/>
        <ViewportPanel 
            viewport_index={0}
            mode={ViewportMode.Top} 
            controller={controller}/>
        <ViewportPanel 
            viewport_index={1}
            mode={ViewportMode.Front} 
            controller={controller}/>
        <PropertyEditor controller={controller}/> 
        <ViewportPanel 
            viewport_index={2}
            location={new Vector(-500,-300,300)}
            mode={ViewportMode.Perspective} 
            controller={controller}/>
        <ViewportPanel 
            viewport_index={3}
            mode={ViewportMode.Side} 
            controller={controller}/>
    </div>;
}
