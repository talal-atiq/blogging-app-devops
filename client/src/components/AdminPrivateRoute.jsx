import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminPrivateRoute = () => {

    const { user } = useSelector((state) => state.userSliceApp);




    return (
        <>
            <div className="">
                {
                    user && user.isAdmin ? <Outlet /> : <Navigate to={'/login'} />
                }
            </div>
        </>
    )
}
export default AdminPrivateRoute;