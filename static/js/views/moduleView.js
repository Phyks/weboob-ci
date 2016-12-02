function moduleView(module) {
    // Set module template
    document.getElementById('main').appendChild(
        document.importNode(
            document.getElementById('moduleViewTemplate').content,
            true
        )
    )

    // Set title
    document.getElementById('moduleTitle').textContent += module.capitalize()

	var heatmap = new CalHeatMap()
	var RANGE = 12
	// TODO: a11y of the heatmap
	heatmap.init({
		itemSelector: '#heatmap',
		domain: 'day',
		data: '/api/v1/modules/' + module + '/{{d:start}}/{{d:end}}',  // Fetch data directly from the API
		afterLoadData: function (json) {
			// Custom parser for data, to put it in the right format
			var heatmapData = {}
			json.data[module].forEach(function (item) {
				let timestamp = moment(item.datetime).unix()
				// Ensure value pre-exists
				if (!heatmapData[timestamp]) {
					heatmapData[timestamp] = 0
				}
				// Compute build score
				if (item.status == 'good') {
					heatmapData[timestamp] += 1
				} else {
					heatmapData[timestamp] -= 1
				}
			})
			return heatmapData
		},
		highlight: 'now',
		legend: [0],
		legendOrientation: 'vertical',
		legendHorizontalPosition: 'left',
		legendVerticalPosition: 'center',
		range: RANGE,
		start: moment().subtract(RANGE - 1, 'days').toDate(),
		itemName: ['build success ratio', 'build success ratio'],
		onClick: function(date, nb) {
            window.location.hash = '#' + date.toISOString()
		}
	})
	document.getElementById('heatmap-controls-previous').addEventListener('click', function () {
        heatmap.previous()
    })
	document.getElementById('heatmap-controls-next').addEventListener('click', function () {
        heatmap.next()
    })

    // Show build details if anchor is here
    var buildDetailsHandler = function () {
        if (window.location.hash) {
            var date = window.location.hash.slice(1)
            heatmap.highlight(moment(date).toDate())
            showBuildDetails(module, date, moment(date).add(1, 'hour').toDate())
        }
    }
    window.addEventListener('hashchange', buildDetailsHandler)
    buildDetailsHandler()
}


function showBuildDetails(module, date_start, date_end) {
    // Set build details template
    document.getElementById('buildDetails').innerHTML = ''
    document.getElementById('buildDetails').appendChild(
        document.importNode(
            document.getElementById('buildDetailsTemplate').content,
            true
        )
    )

    // Set title
    document.querySelector('#buildDetails h2').innerText = 'Builds on the ' + moment(date_start).format('DD/MM/YY[ at ]HH:mm')

    fetch('/api/v1/modules/' + module + '/' + moment(date_start).toISOString() + '/' + moment(date_end).toISOString())
        .then(function (response) {
            return response.json()
        }).then(function (json) {
            // Remove spinning wheel
            document.querySelector('.loader').remove()

            if (json.data.length == 0) {
                return;
            }

            // Set build details table template
            document.getElementById('buildDetails').appendChild(
                document.importNode(
                    document.getElementById('buildDetailsTableTemplate').content,
                    true
                )
            )

            var table = document.getElementById('buildDetailsTable')
            json.data[module].forEach(function (row) {
                var buildRow = document.createElement('tr')
                buildRow.className = row.status

                var timeCell = document.createElement('td')
                timeCell.innerText = moment(row.datetime).format('HH:mm')
                buildRow.appendChild(timeCell)

                var originCell = document.createElement('td')
                originCell.innerText = row.origin
                buildRow.appendChild(originCell)

                var statusCell = document.createElement('td')
                statusCell.innerText = row.status
                statusCell.className = row.status
                buildRow.appendChild(statusCell)

                table.appendChild(buildRow)
            })
        }).catch(function (ex) {
            alert('Unable to fetch data. :/')
            console.error('Parsing of fetched data failed: ', ex)
        })
}
