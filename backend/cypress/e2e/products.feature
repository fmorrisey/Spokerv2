Feature: Products API

    Scenario: Fetch products successfully
        Given request GET "/products"
        Then the response status code should be "200"
        Then the response body should have length "3"

