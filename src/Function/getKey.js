let idx = -1;

const keys = [
  ["244d5ca662a87765be0bac7f91b87f5e", "572278e4cff7c7d93d28fde95baced91bcb2b60efccff3d9328d85e18ab5bd15"],
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
