Feature: API Server Error Handling

    Scenario: Non-existent endpoint returns 404
        Given request GET "/non-existent"
        Then the response status code should be "404"

