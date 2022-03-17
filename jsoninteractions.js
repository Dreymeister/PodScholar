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

	// Simple authentication (many flaws)
	localStorage.setItem(LOCAL_STORAGE_EMAIL, email)
	localStorage.setItem(LOCAL_STORAGE_FIRST_NAME, database.users[email].firstName)
	localStorage.setItem(LOCAL_STORAGE_LAST_NAME, database.users[email].lastName)
	window.location.href = "about.html?welcome=true"
	$.LoadingOverlay("hide")
}

uploadPodcast = (podcast, database) => {
	database.podcasts.unshift(podcast)
	database.users[localStorage.getItem(LOCAL_STORAGE_EMAIL)].uploadedPodCasts.unshift(podcast)
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

createFeed = (feedId, database) => {
	// Not so many podcasts in database, so display all
	let feed = $(`#${feedId}`)
	for(let i = 0; i < database.podcasts.length; i++) {
		let pc = database.podcasts[i]

		feed.append(`
			<div class="col-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            Test
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
	}

	$.LoadingOverlay("hide")
}


searchByKeyword = (feedId, keyword, database) => {
	let feed = $(`#${feedId}`)
	for(let i = 0; i < database.podcasts.length; i++) {
		let pc = database.podcasts[i]
		const condition = pc.firstName.includes(keyword) || pc.lastName.includes(keyword) 
			|| pc.keywords.includes(keyword) || pc.publishDate.includes(keyword) 
			|| pc.doi.includes(keyword)
		console.log(keyword)
		if(!condition) continue
		feed.append(`
			<div class="col-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            Test
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
	}

	$.LoadingOverlay("hide")
}