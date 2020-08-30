import React = require("react");
import { createController } from "../controller";
import { useSignal } from "./useSignal";
import { ViewportMode } from "./Viewport";
import { Vector } from "../model/Vector";
import { ViewportPanel } from "./ViewportPanel";
import { themeColors } from "../theme";
import { ActorList } from "./ActorList";
import { PropertyEditor } from "./PropertyEditor";

export const Application = ({ controller = createController() }) => {

    const unrealMap = useSignal(controller.map);
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
            mode={ViewportMode.Top} 
            controller={controller}/>
        <ViewportPanel 
            mode={ViewportMode.Front} 
            controller={controller}/>
        <PropertyEditor controller={controller}/> 
        <ViewportPanel 
            location={new Vector(-500,-300,300)}
            mode={ViewportMode.Perspective} 
            controller={controller}/>
        <ViewportPanel 
            mode={ViewportMode.Side} 
            controller={controller}/>
    </div>;

}
