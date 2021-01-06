import "script-loader!../build/thrift/browser/thrift.js"
import "script-loader!../build/thrift/browser/common_types.js"
import "script-loader!../build/thrift/browser/serialized_result_set_types.js"
import "script-loader!../build/thrift/browser/omnisci_types.js"
import "script-loader!../build/thrift/browser/OmniSci.js"
import "script-loader!../build/thrift/browser/completion_hints_types.js"
import { MapdCon } from "./mapd-con-es6"

/*
Export as a global to keep 
backwards compatability with
how we used MapdCon prior to 5.5
*/
window.MapdCon = MapdCon

/*
Re-export the MapdCon class defined in 
mapd-con-es6 as Connector. The rename helps 
should alleviate any confusion from needing to use
new MapdCon.MapdCon() etc

This allows for:

    import { Connector } from MapdCon;

Or - in observable:

    Connector = {
        const MapdCon = await require('@mapd/connector');
        return MapdCon.Connector;
    }

*/
export { MapdCon as default } from "./mapd-con-es6";
