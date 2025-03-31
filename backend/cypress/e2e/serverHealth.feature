Feature: API Server Health Check

    Scenario: Server responds successfully
        Given request GET "/health"
        Then the response status code should be "200"
        Then the response body field "message" should equal "Server is healthy"
        Then the response body field "status" should equal "success"