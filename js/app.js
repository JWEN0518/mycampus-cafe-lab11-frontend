const app = Vue.createApp({
    data() {
        return {
            menuItems: [],
            message: "",
            isLoggedIn: Boolean(getToken()),
            login: {
                username: "",
                password: ""
            },
            newMenu: {
                menu_name: "",
                category: "",
                price: "",
                availability: "Available"
            }
        };
    },

    mounted() {
        this.fetchMenu();
    },

    methods: {
        async loginStaff() {
            this.message = "";

            try {
                const response = await fetch(API_CONFIG.BASE_URL + "/login", {
                    method: "POST",
                    headers: publicHeaders(),
                    body: JSON.stringify({
                        username: this.login.username,
                        password: this.login.password
                    })
                });

                const result = await readJson(response);

                if (response.ok && result.token) {
                    setToken(result.token);
                    this.isLoggedIn = true;
                    this.login.password = "";
                    this.message = "Login successful. Protected menu controls are now available.";
                } else {
                    this.message = handleApiError(response, result);
                }
            } catch (error) {
                this.message = "Unable to connect to the backend server.";
                console.error(error);
            }
        },

        logoutStaff() {
            clearToken();
            this.isLoggedIn = false;
            this.message = "You have logged out.";
        },

        async fetchMenu() {
            try {
                const response = await fetch(API_CONFIG.BASE_URL + "/menu", {
                    method: "GET",
                    headers: publicHeaders()
                });

                const result = await readJson(response);

                if (response.ok && Array.isArray(result)) {
                    this.menuItems = result;
                } else {
                    this.menuItems = [];
                    this.message = handleApiError(response, result);
                }
            } catch (error) {
                this.message = "Failed to load menu data.";
                console.error(error);
            }
        },

        async addMenu() {
            if (!getToken()) {
                this.isLoggedIn = false;
                this.message = "Please log in before adding a menu item.";
                return;
            }

            try {
                const response = await fetch(API_CONFIG.BASE_URL + "/menu", {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        menu_name: this.newMenu.menu_name,
                        category: this.newMenu.category,
                        price: Number(this.newMenu.price),
                        availability: this.newMenu.availability
                    })
                });

                const result = await readJson(response);

                if (response.ok) {
                    this.message = "Menu item added successfully.";
                    this.newMenu = {
                        menu_name: "",
                        category: "",
                        price: "",
                        availability: "Available"
                    };
                    await this.fetchMenu();
                } else {
                    this.processProtectedError(response, result);
                }
            } catch (error) {
                this.message = "Server connection error while adding the menu item.";
                console.error(error);
            }
        },

        async updateMenu(item) {
            if (!getToken()) {
                this.isLoggedIn = false;
                this.message = "Please log in before updating a menu item.";
                return;
            }

            try {
                const response = await fetch(
                    API_CONFIG.BASE_URL + "/menu/" + item.menu_id,
                    {
                        method: "PUT",
                        headers: authHeaders(),
                        body: JSON.stringify({
                            menu_name: item.menu_name,
                            category: item.category,
                            price: Number(item.price),
                            availability: item.availability
                        })
                    }
                );

                const result = await readJson(response);

                if (response.ok) {
                    this.message = "Menu item updated successfully.";
                    await this.fetchMenu();
                } else {
                    this.processProtectedError(response, result);
                }
            } catch (error) {
                this.message = "Unable to update the menu item.";
                console.error(error);
            }
        },

        async deleteMenu(id) {
            const confirmed = window.confirm(
                "Are you sure you want to delete this menu item?"
            );

            if (!confirmed) {
                return;
            }

            if (!getToken()) {
                this.isLoggedIn = false;
                this.message = "Please log in before deleting a menu item.";
                return;
            }

            try {
                const response = await fetch(
                    API_CONFIG.BASE_URL + "/menu/" + id,
                    {
                        method: "DELETE",
                        headers: authHeaders()
                    }
                );

                const result = await readJson(response);

                if (response.ok) {
                    this.message = "Menu item deleted successfully.";
                    await this.fetchMenu();
                } else {
                    this.processProtectedError(response, result);
                }
            } catch (error) {
                this.message = "Unable to delete the menu item.";
                console.error(error);
            }
        },

        processProtectedError(response, result) {
            if (response.status === 401) {
                clearToken();
                this.isLoggedIn = false;
            }

            this.message = handleApiError(response, result);
        }
    }
});

app.mount("#app");
