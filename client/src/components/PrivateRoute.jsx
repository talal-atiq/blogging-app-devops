import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';



const PrivateRoute = () => {


    const { user } = useSelector((state) => state.userSliceApp);


    return (
        <>
            <div className="">
                {
                    user ? <Outlet /> : <Navigate to={'/login'} />
                }
            </div>
        </>
    )
}
export default PrivateRoute