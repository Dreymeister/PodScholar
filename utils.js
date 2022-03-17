getParams = (url = window.location) => {
	let params = {}
	new URL(url).searchParams.forEach(function (val, key) {
		if (params[key] !== undefined) {
			if (!Array.isArray(params[key])) {
				params[key] = [params[key]]
			}
			params[key].push(val)
		} else {
			params[key] = val
		}
	})
	return params
}

renderNavBar = () => {
	if(!isUserLoggedIn()) {
		return
	}
	$("#menuCollapse").remove()
	$("#navbarResponsive").empty()
	$("#navbarResponsive").removeClass("collapse navbar-collapse")
	$("#navbarResponsive").append(`
		<ul class="navbar-nav ms-auto py-4 py-lg-0">
			<li class="nav-item">
            	<div class="drop-down">
            	<button class="btn btn-small btn-dark" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            		Hello, ${localStorage.getItem(LOCAL_STORAGE_FIRST_NAME)} ${localStorage.getItem(LOCAL_STORAGE_LAST_NAME)}
            	</button>
            	<div class="dropdown-menu" aria-labelledby="dropdownMenu">
            		<a href="dashboard.html"><button class="w-100 dropdown-item">Dashboard</button></a>
            		<a href="rules.html"><button class="w-100 dropdown-item">Rules</button></a>
            		<a href="howtoupload.html"><button class="w-100 dropdown-item">How to upload?</button></a>
            		<a href="upload.html"><button class="w-100 dropdown-item">Upload now!</a></button></a>
					<a onclick="logOut()"><button class="w-100 dropdown-item">Log out</button></a>
				</div>
            </li>
        </ul>
	`)
}

logOut = () => {
	localStorage.removeItem(LOCAL_STORAGE_EMAIL)
	localStorage.removeItem(LOCAL_STORAGE_FIRST_NAME)
	localStorage.removeItem(LOCAL_STORAGE_LAST_NAME)

	window.location.href = "login.html"
}

addSearchFunctionToSearchBar = (feedId, id) => {
	let sb = $(`#${id}`)

	sb.on("keypress", (e) => {
		if(e.keyCode === 13) {
			getDatabaseAndDo(searchByKeyword, [feedId, sb.val()])
		}
	})
}