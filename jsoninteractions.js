const BASE_URL = "https://jsonblob.com/api/jsonBlob/953215137297481728"
const LOCAL_STORAGE_EMAIL = "PodScholarUserEmail"
const LOCAL_STORAGE_FIRST_NAME = "PodScholarUserFirstName"
const LOCAL_STORAGE_LAST_NAME = "PodScholarUserLastName"

getDatabaseAndDo = (callback, params = []) => {
	$.LoadingOverlay("show")
	$.ajax({
		type: "GET",
		url: BASE_URL,
		success: (database) => {
			callback(...params, database)
		}, 
		error: () => {
			$.LoadingOverlay("hide")
		}
	})
}

registerUser = (user, confirmPassword, database) => {
	if(!checkPasswordMatch(user, confirmPassword)) {
		$.LoadingOverlay("hide")
		$.toast({
		    heading: "Sorry, your password does not match your confirm password",
		    text: "Please check your password and confirm password...",
		    showHideTransition: "slide",
		    icon: "error"
		})
		return 
	}

	if(checkUserAlreadyExisted(user, database)) {
		$.LoadingOverlay("hide")
		$.toast({
		    heading: "Sorry, your email is duplicated!",
		    text: "Please choose another email...",
		    showHideTransition: "slide",
		    icon: "error"
		})
		return 
	}

	database.users[user.email] = user
	$.ajax({
		type: "PUT",
		url: BASE_URL,
		data: JSON.stringify(database),
		contentType: "application/json",
		success: () => {
			$.LoadingOverlay("hide")
			$.toast({
			    heading: "New user created!",
			    text: "We're redirecting you to interesting pages...",
			    showHideTransition: 'slide',
			    icon: 'success',
			    afterHidden: () => {
			    	window.location.href = "rules.html"
			    }
			})
		},
		error: () => {
			$.LoadingOverlay("hide")
		}
	})
}

checkUserAlreadyExisted = (user, database) => {
	return database.users[user.email] != null
}

checkPasswordMatch = (user, confirmPassword) => {
	return user.password == confirmPassword
}

loginUser = (email, passwordSHA256, database) => {
	if(!database.users[email] || database.users[email].password != passwordSHA256) {
		$.LoadingOverlay("hide")
		$.toast({
		    heading: "Email does not exist or passowrd is incorrect!",
		    text: "Please try again...",
		    showHideTransition: 'slide',
		    icon: 'error'
		})
		return
	}

	// Simple authentication
	localStorage.setItem(LOCAL_STORAGE_EMAIL, email)
	localStorage.setItem(LOCAL_STORAGE_FIRST_NAME, database.users[email].firstName)
	localStorage.setItem(LOCAL_STORAGE_LAST_NAME, database.users[email].lastName)
	window.location.href = "about.html?welcome=true"
	$.LoadingOverlay("hide")
}

uuid = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  	);
}

uploadPodcast = (podcast, database) => {
	const id = uuid()

	database.podcasts[id] = podcast
	database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].uploadedPodCasts.unshift(id)

	database.publishYear[podcast.publishDate.substring(0, 4)] = database.publishYear[podcast.publishDate.substring(0, 4)] ? database.publishYear[podcast.publishDate.substring(0, 4)] : []
	database.publishYear[podcast.publishDate.substring(0, 4)].unshift(id)
	
	$.ajax({
		type: "PUT",
		url: BASE_URL,
		data: JSON.stringify(database),
		contentType: "application/json",
		success: () => {
			$.LoadingOverlay("hide")
			$.toast({
			    heading: "New podcast uploaded!",
			    text: "Go to your feed to check it out...",
			    showHideTransition: 'slide',
			    icon: 'success'
			})
		},
		error: () => {
			$.LoadingOverlay("hide")
		}
	})
}

createFeed = (feedId, order, database) => {
	// Not so many podcasts in database, so display all
	let feed = $(`#${feedId}`)
	const keys = Object.keys(database.podcasts)
	const renderRating = (id, rating) => {
		let content = ``
		rating = rating ? rating : 0

		for(let k = 5; k >= 1; k--) {
			let checked = rating == k ? "checked" : ""
			content += `<input class="star star-${k}" id="star-${id}-${k}" type="radio" name="star" ${checked}/>
					    <label class="star star-${k}" for="star-${id}-${k}" id="${id}${k}"></label>`
		}
		let body = `
			<form action="">
			    ${content}
			</form>
		`

		return body
	}
	if(!order) {
		for(let i = 0; i < keys.length; i++) {
			let pc = database.podcasts[keys[i]]
			let isLoggedIn = localStorage.getItem(LOCAL_STORAGE_EMAIL) !== null
			let rating = isLoggedIn ? database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)]["ratedPodCasts"][keys[i]] : 0
			feed.append(`
				<div class="col-12 mb-3">
	                <div class="card">
	                    <div class="card-body">
	                        <h5 class="card-title">
	                            ${pc.articleTitle}
	                        </h5>
	                        <p class="card-text m-0">Author: ${pc.firstName} ${pc.lastName}</p>
	                        <p class="card-text m-0">Tags: ${pc.keywords}</p>
	                        <p class="card-text m-0">Published date: ${pc.publishDate}</p>
	                        <p class="card-text m-0 mb-3">DOI: ${pc.doi}</p>

	                        <div id="${keys[i]}">
	                        ${
	                        	isLoggedIn ? (database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].savedPodCasts.indexOf(keys[i]) < 0 && database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].uploadedPodCasts.indexOf(keys[i]) === -1? `<a href="#!" onclick="savePodcast('${keys[i]}')"><i class="fas fa-bookmark"></i> Save this podcast</a>` : '<p class="mt-0 mb-0"><i class="fas fa-check"></i> This podcast is already saved or uploaded by you</p>')
											: '<p>You need to login to save this podcast</p>'
	                    	}
	                    	</div>
	                    	<div class="stars mb-0">
	                    		<small>Your rating: </small>
							  	${isLoggedIn ? renderRating(keys[i], rating) : "<small>You need login to rate this podcast</small>"}
							</div>
	                    <div class="card-footer">
	                        <audio controls>
	                            <source src="${pc.url}" type="audio/mpeg">
	                        </audio>
	                    </div>
	                </div>
	            </div>
			`)

			$(document).ready(() => {
				for(let j = 1; j <= 5; j++) {
					$(`#${keys[i]}${j}`).on("click", function() {
						getDatabaseAndDo(ratePodcast, [keys[i], j])
					})
				}
			})
		}
	} else {
		for(let i = keys.length - 1; i >= 0; i--) {
			let pc = database.podcasts[keys[i]]
			let isLoggedIn = localStorage.getItem(LOCAL_STORAGE_EMAIL) !== null
			let rating = isLoggedIn ? database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)]["ratedPodCasts"][keys[i]] : 0
			feed.append(`
				<div class="col-12 mb-3">
	                <div class="card">
	                    <div class="card-body">
	                        <h5 class="card-title">
	                            ${pc.articleTitle}
	                        </h5>
	                        <p class="card-text m-0">Author: ${pc.firstName} ${pc.lastName}</p>
	                        <p class="card-text m-0">Tags: ${pc.keywords}</p>
	                        <p class="card-text m-0">Published date: ${pc.publishDate}</p>
	                        <p class="card-text m-0 mb-3">DOI: ${pc.doi}</p>

	                        <div id="${keys[i]}">
	                        ${
	                        	isLoggedIn ? (database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].savedPodCasts.indexOf(keys[i]) < 0 && database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].uploadedPodCasts.indexOf(keys[i]) === -1? `<a href="#!" onclick="savePodcast('${keys[i]}')"><i class="fas fa-bookmark"></i> Save this podcast</a>` : '<p class="mt-0 mb-0"><i class="fas fa-check"></i> This podcast is already saved or uploaded by you</p>')
											: '<p>You need to login to save this podcast</p>'
	                    	}
	                    	</div>
	                    	<div class="stars mb-0">
	                    		<small>Your rating: </small>
							  	${isLoggedIn ? renderRating(keys[i], rating) : "<small>You need login to rate this podcast</small>"}
							</div>
	                    <div class="card-footer">
	                        <audio controls>
	                            <source src="${pc.url}" type="audio/mpeg">
	                        </audio>
	                    </div>
	                </div>
	            </div>
			`)

			$(document).ready(() => {
				for(let j = 1; j <= 5; j++) {
					$(`#${keys[i]}${j}`).on("click", function() {
						getDatabaseAndDo(ratePodcast, [keys[i], j])
					})
				}
			})
		}
	}

	$.LoadingOverlay("hide")
}

ratePodcast = (id, rating, database) => {
	database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)]["ratedPodCasts"][id] = rating
	$.ajax({
		type: "PUT",
		url: BASE_URL,
		data: JSON.stringify(database),
		contentType: "application/json",
		success: () => {
			$.LoadingOverlay("hide")
		},
		error: () => {
			$.LoadingOverlay("hide")
		}
	})
}

savePodcast = (id) => {
	let save = (id, database) => {
		database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].savedPodCasts.unshift(id)
		$.ajax({
			type: "PUT",
			url: BASE_URL,
			data: JSON.stringify(database),
			contentType: "application/json",
			success: () => {
				$.LoadingOverlay("hide")
				$.toast({
				    heading: "New podcast has been saved!",
				    text: "Go to your your dashboard to check it out...",
				    showHideTransition: 'slide',
				    icon: 'success'
				})
				$(`#${id}`).empty()
				$(`#${id}`).append('<p class="mt-0 mb-0"><i class="fas fa-check"></i> This podcast is already saved</p>')
			},
			error: () => {
				$.LoadingOverlay("hide")
				$.toast({
				    heading: "Some errors occured!",
				    text: "Some errors occured!...",
				    showHideTransition: 'slide',
				    icon: 'erorr'
				})
			}
		})
	}

	getDatabaseAndDo(save, [id])
}

searchByKeyword = (feedId, keyword, database) => {
	let feed = $(`#${feedId}`)
	$(`#${feedId}`).empty()
	keyword = keyword.toLowerCase()
	const keys = Object.keys(database.podcasts)
	let foundAtleadtOne = false
	for(let i = 0; i < keys.length; i++) {
		let pc = database.podcasts[keys[i]]
		const condition = pc.firstName.toLowerCase().includes(keyword) || pc.lastName.toLowerCase().includes(keyword) 
			|| pc.keywords.toLowerCase().includes(keyword) || pc.publishDate.toLowerCase().includes(keyword) 
			|| pc.doi.toLowerCase().includes(keyword)
		if(!condition) continue
		feed.append(`
			<div class="col-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${pc.articleTitle}
                        </h5>
                        <p class="card-text m-0">Author: ${pc.firstName} ${pc.lastName}</p>
                        <p class="card-text m-0">Tags: ${pc.keywords}</p>
                        <p class="card-text m-0">Published date: ${pc.publishDate}</p>
                        <p class="card-text m-0">DOI: ${pc.doi}</p>
                    </div>
                    <div class="card-footer">
                        <audio controls>
                            <source src="${pc.url}" type="audio/mpeg">
                        </audio>
                    </div>
                </div>
            </div>
		`)
		foundAtleadtOne = true
	}

	if(!foundAtleadtOne) feed.append('<small>No results.</small>')
	$.LoadingOverlay("hide")
}

searchByYearPublish = (feedId, year, database) => {
	let feed = $(`#${feedId}`)
	$(`#${feedId}`).empty()
	const keys = database.publishYear[year]
	if(!keys || keys.length == 0) {
		feed.append('<small>No results.</small>')
		$.LoadingOverlay("hide")
		return
	}

	for(let i = 0; i < keys.length; i++) {
		let pc = database.podcasts[keys[i]]
		feed.append(`
			<div class="col-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${pc.articleTitle}
                        </h5>
                        <p class="card-text m-0">Author: ${pc.firstName} ${pc.lastName}</p>
                        <p class="card-text m-0">Tags: ${pc.keywords}</p>
                        <p class="card-text m-0">Published date: ${pc.publishDate}</p>
                        <p class="card-text m-0">DOI: ${pc.doi}</p>
                    </div>
                    <div class="card-footer">
                        <audio controls>
                            <source src="${pc.url}" type="audio/mpeg">
                        </audio>
                    </div>
                </div>
            </div>
		`)
		foundAtleadtOne = true
	}

	$.LoadingOverlay("hide")
}