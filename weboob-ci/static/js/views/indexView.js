function indexView() {
    // Set index template
    document.getElementById('main').appendChild(
        document.importNode(
            document.getElementById('indexViewTemplate').content,
            true
        )
    )

    // Fetch data from the API
    fetch('/api/v1/modules')
        .then(function (response) {
            return response.json()
        }).then(function (json) {
            // Remove spinning wheel
            document.querySelector('.loader').remove()

            // Set table template
            document.getElementById('main').appendChild(
                document.importNode(
                    document.getElementById('indexViewTableTemplate').content,
                    true
                )
            )

            var table = document.getElementById('modulesStatus')
            json.data.forEach(function (row) {
                var moduleRow = document.createElement('tr')
                moduleRow.tabIndex = 0
                moduleRow.role = 'button'
                moduleRow.setAttribute('aria-label', 'See history for module ' + row.module + '.')
                moduleRow.className = row.status + ' hint--right'
                var moduleRowClickFunction = function () {
					window.location = '/module/' + row.module
                }
                moduleRow.addEventListener('click', moduleRowClickFunction, false)
                moduleRow.addEventListener('keypress', function (e) {
                    // Activate the click event with Enter or Space for accessibility
                    if (e.keyCode == 13 || e.keyCode == 32) {
                        moduleRowClickFunction ()
                    }
                })

                var nameCell = document.createElement('td')
                nameCell.innerText = row.module
                moduleRow.appendChild(nameCell)

                var statusCell = document.createElement('td')
                statusCell.innerText = row.status
                statusCell.className = row.status
                moduleRow.appendChild(statusCell)

                var lastUpdateCell = document.createElement('td')
                lastUpdateCell.innerText = moment(row.datetime).fromNow()
                moduleRow.appendChild(lastUpdateCell)

                table.appendChild(moduleRow)
            })
        }).catch(function (ex) {
            alert('Unable to fetch data. :/')
            console.error('Parsing of fetched data failed: ', ex)
        })
}
