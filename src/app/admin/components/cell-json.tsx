import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";


const CellJson = ({value}: { value: any }) => {
    return (
        <Popover>
            <PopoverTrigger>
                <span className="text-blue-600 underline cursor-pointer">Show</span>
            </PopoverTrigger>
            <PopoverContent>
                <div className="p-4">
                    <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
                </div>
            </PopoverContent>
        </Popover>
    )
}