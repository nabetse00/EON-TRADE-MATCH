import { Handle, Position } from 'reactflow';


function AssetNode({ data }: any) {

    function sliceAddress(size: number) {
        return `${data.label.slice(0, size)}...${data.label.slice(-size)}`
    }

    function getType(type: string) {
        switch (type) {
            case "0":
                return "NATIVE ZEN"
                break;
            case "1":
                return "TOKENs"
                break;
            case "2":
                return "NFTs"
                break;
            default:
                return type
                break;
        }
    }

    function getColor(type: string) {
        switch (type) {
            case "0":
                return "red"
                break;
            case "1":
                return "blue"
                break;
            case "2":
                return "green"
                break;
            default:
                return type
                break;
        }
    }
    return (
        <div
            style={{
                backgroundColor: "#9ca8b3",
                padding: "20px",
                borderRadius: "20px",
                borderColor: getColor(data.type),
                borderWidth: "0.5em",
                borderStyle: "solid",

            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                id={`${data.id}.left`}
                style={{ borderRadius: "0" }}
            />
            <div id={`type.${data.id}`}>{getType(data.type)}</div>
            <div id={data.id}>{sliceAddress(5)}</div>
            <Handle
                type="source"
                position={Position.Right}
                id={`${data.id}.right`}
                style={{ borderRadius: 0 }}
            />

        </div>
    );
}

export default AssetNode;