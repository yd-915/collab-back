let idx = -1;

const keys = [
  ["728824725279-36qsuu8vr8o8q9ek7e5u7jute4v6ktdt.apps.googleusercontent.com", "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"],
 
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
