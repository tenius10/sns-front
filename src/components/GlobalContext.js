import React, {createContext, useState} from "react";

export const GlobalContext=createContext();

export function ContextProvider({children}){
    const [myInfo, setMyInfo]=useState(null);

    return (
        <GlobalContext.Provider value={{myInfo, setMyInfo}}>
            {children}
        </GlobalContext.Provider>
    )
}