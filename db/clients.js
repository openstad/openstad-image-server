var records = [
    { id: 1, username: 'Buurtbudget dev', token: 'LyWBvPBs8SvTn8r6KuKXXVCY', displayName: 'Buurtbudget', emails: [ { value: 'info@amsterdam.nl' } ] }
];

exports.findByToken = function(token, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.token === token) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
