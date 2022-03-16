isUserLoggedIn = () => {
	return localStorage.getItem(LOCAL_STORAGE_EMAIL) != null
}