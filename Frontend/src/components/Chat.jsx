import { useContext, useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import lodash from 'lodash';
import { UserContext } from '../UserContext';
import axios from 'axios';

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageScroll = useRef();

  const { username, id } = useContext(UserContext);

  useEffect(() => {
    connectToWS();
  }, []);

  function connectToWS() {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWS();
      }, 1000);
    });
  }

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
    } else if ('text' in messageData) {
      console.log({ messageData });
      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
        },
      ]);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText('');
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        id: Date.now(),
      },
    ]);
  }

  useEffect(() => {
    const div = messageScroll.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/' + selectedUserId).then((res) => {});
    }
  }, [selectedUserId]);

  // remove the logged in user from the contact list
  const excludeUser = { ...onlinePeople };
  delete excludeUser[id];

  // remove the duplicate messages
  const messageWithoutDup = lodash.uniqBy(messages, 'id');

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
          {!!selectedUserId && (
            <div className="relative h-full ">
              <div className="pt-4 overflow-y-scroll absolute inset-0 ">
                {messageWithoutDup.map((message) => (
                  <div
                    className={
                      message.sender === id ? 'text-right' : 'text-left'
                    }
                  >
                    <div
                      className={
                        'text-left inline-block p-2 my-2 text-md rounded-md  ' +
                        (message.sender === id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700')
                      }
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messageScroll}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2">
            <input
              onChange={(e) => {
                setNewMessageText(e.target.value);
              }}
              type="text"
              placeholder="Type here"
              className="bg-white flex-grow rounded-sm border"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
