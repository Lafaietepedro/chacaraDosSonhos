const syncablePropertyNames = new Set([
  'Chácara dos Sonhos',
  'Chacara dos Sonhos',
  'ReservaNexa',
  'Venue Eventos',
  'Villa Aurora',
])

function classifyExistingProperty(name) {
  return syncablePropertyNames.has(name) ? 'sync' : 'reject'
}

module.exports = {
  classifyExistingProperty,
}
