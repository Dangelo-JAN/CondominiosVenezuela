import { KeyDetailsBox } from "./keydetailboxes"
import { Link } from "react-router-dom"

export const ContentWraperMain = ({ children }) => {
    return (
        <div className="container h-full w-auto flex flex-col">
            {children ? children : null}
        </div>
    )
}

export const KeyDetailBoxContentWrapper = ({ imagedataarray, data }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {imagedataarray.map((item) => (
                <Link
                    to={item.path}
                    key={item.dataname}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                >
                    <KeyDetailsBox
                        image={item.image}
                        dataname={item.dataname}
                        data={data ? data[item["dataname"]] : ""}
                    />
                </Link>
            ))}
        </div>
    )
}
