let idx = -1;

const keys = [
  [process.env.COMPILE_CLIENT_ID1, process.env.COMPILE_CLIENT_SECRET1],
];

const sz = keys.length;

const AwesomeKey = () => {
  idx++;
  if (idx == sz) idx = 0;
 
  return keys[idx];
};

module.exports = {
  AwesomeKey,
};
