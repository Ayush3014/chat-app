export default function Avatar({ userId, username }) {
  const colors = [
    'bg-pink-200',
    'bg-teal-200',
    'bg-green-200',
    'bg-purple-200',
    'bg-yellow-200',
    'bg-orange-400',
    'bg-amber-300',
    'bg-red-200',
    'bg-violet-400',
    'bg-indigo-400',
    'bg-violet-400',
  ];

  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={'w-8 h-8 bg- rounded-full flex items-center ' + color}>
      <div className="text-center w-full font-semibold">
        {username[0].toUpperCase()}
      </div>
    </div>
  );
}
