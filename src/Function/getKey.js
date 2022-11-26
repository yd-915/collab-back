let idx = -1;

const keys = [
  ["244d5ca662a87765be0bac7f91b87f5e", "206d7485630efe37352a60ac2c358838c722cfb1832501488c98a04132635eaf"],
 
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
