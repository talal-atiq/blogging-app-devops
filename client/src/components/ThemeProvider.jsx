import React from 'react'
import { useSelector } from 'react-redux';



const ThemeProvider = ({ children }) => {



    const { theme } = useSelector((state) => state.themeSliceApp);



    return (
        <div className={`${theme} ${theme === 'light' ? 'bg-blue-50 text-zinc-700' : 'bg-zinc-800 text-zinc-200'}`}>
            {children}
        </div>
    )
}
export default ThemeProvider;