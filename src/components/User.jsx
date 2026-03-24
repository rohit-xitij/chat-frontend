import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setSelectedUser } from "../store/usersSlice";

const User = ({ user, onClick }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(setSelectedUser({ user }));
    if (onClick) onClick();
  };

  return (
    <Link onClick={handleClick} to={`/chat/${user._id}`}>
      <div className="flex gap-4 items-center bg-gray-50 hover:bg-gray-200 py-2 px-4 cursor-pointer border-b border-b-gray-500">
        <div className="relative">
          <div className="flex h-8 w-8 pb-0.5 items-center justify-center rounded-full bg-indigo-700 text-xl font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span
            className={`absolute right-0 top-0 block h-2 w-2 rounded-full ring-1 ring-white ${
              user.online ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        <div>
          <h2 className="line-clamp-1 text-lg">{user.name}</h2>
        </div>
      </div>
    </Link>
  );
};

export default User;
