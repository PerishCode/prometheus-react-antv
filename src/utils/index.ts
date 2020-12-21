function fetchPrometheus(params: string) {
  // return fetch('http://172.31.246.195:9090/api/v1/query_range?' + params)
  return fetch(
    'http://demo.robustperception.io:9090/api/v1/query_range?' + params
  )
}

export { fetchPrometheus }
