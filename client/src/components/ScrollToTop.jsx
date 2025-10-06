import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'



const ScrollToTop = () => {

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(-10, -10);
    }, [pathname])


    return null;
}

export default ScrollToTop;