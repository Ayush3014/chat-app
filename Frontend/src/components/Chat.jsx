import { useContext, useEffect, useState } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import TypeMessage from './TypeMessage';
import { UserContext } from '../UserContext';

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);

    ws.addEventListener('message', handleMessage);
  }, []);

  // to remove duplicates
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });

    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    }
  }

  // remove the logged in user from the contact list
  const excludeUser = { ...onlinePeople };
  delete excludeUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 ">
        <Logo />
        {Object.keys(excludeUser).map((userId) => (
          <div
            onClick={() => setSelectedUserId(userId)}
            key={userId}
            className={
              'border-b border-gray-200 flex gap-2 items-center cursor-pointer ' +
              (selectedUserId === userId ? 'bg-blue-50' : '')
            }
          >
            {userId === selectedUserId ? (
              <div className="w-1 bg-blue-600 h-12 rounded-r-md"></div>
            ) : (
              ''
            )}
            <div className="py-2 p-4 flex items-center gap-2">
              <Avatar userId={userId} username={onlinePeople[userId]} />
              <span>{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-200 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex justify-center items-center h-full text-gray-500">
              <div>No user selected</div>
            </div>
          )}
        </div>
        <TypeMessage />
      </div>
    </div>
  );
}
