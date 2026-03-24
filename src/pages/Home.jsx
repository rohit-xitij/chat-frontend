import React from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { useSelector } from "react-redux";

const Home = () => {
  const users = useSelector((state) =>
    [...state.users.usersData].sort(
      (a, b) => (b.online === true) - (a.online === true),
    ),
  );

  return (
    <div className="flex min-h-screen flex-col   bg-background gap-5">
      <Navbar />

      <div className="px-32 pb-20">
        <div className="mb-8 mt-4">
          <h1 className="text-2xl font-bold text-foreground">All Users</h1>
          <p className="text-sm text-muted">
            Click on a user to start chatting
          </p>
        </div>

        <div className="grid grid-cols-4 gap-5">
          {users.map((u) => (
            <Card key={u._id} user={u} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
