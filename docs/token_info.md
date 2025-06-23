# Token Info

> Get detailed metadata and realtime price information for any native asset or ERC20 token including symbol, name, decimals, supply information, USD pricing, and logo URLs.

## OpenAPI

````yaml evm/openapi/token-info.json get /v1/evm/token-info/{uri}
paths:
  path: /v1/evm/token-info/{uri}
  method: get
  servers:
    - url: https://api.sim.dune.com
  request:
    security: []
    parameters:
      path:
        uri:
          schema:
            - type: string
              required: true
              description: >-
                The contract address of the token or 'native' for the native
                token of the chain
      query:
        chain_ids:
          schema:
            - type: string
              required: true
              description: >-
                Either 'all' or a comma separated list of chain ids to get token
                info for
            - type: 'null'
              required: true
              description: >-
                Either 'all' or a comma separated list of chain ids to get token
                info for
        limit:
          schema:
            - type: integer
              required: false
              description: Maximum number of prices to return
              minimum: 0
            - type: 'null'
              required: false
              description: Maximum number of prices to return
        offset:
          schema:
            - type: string
              required: false
              description: >-
                The offset to paginate through result sets; this is a cursor
                being passed from the previous response, only use what the
                backend returns here
      header:
        X-Sim-Api-Key:
          schema:
            - type: string
              required: true
              description: API key to access the service
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              contract_address:
                allOf:
                  - type: string
                    description: >-
                      The contract address of the token or 'native' for the
                      native token
              tokens:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/TokenInfo'
                    description: Array of token information across different chains
              next_offset:
                allOf:
                  - type: string
                    nullable: true
                    description: Pagination cursor for the next page of results
            refIdentifier: '#/components/schemas/TokensResponse'
            requiredProperties:
              - contract_address
              - tokens
        examples:
          example:
            value:
              contract_address: native
              tokens:
                - chain: ethereum
                  chain_id: 1
                  price_usd: 12.34
                  symbol: ETH
        description: Successful Response
    '400':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: >-
              Bad Request - The request could not be understood by the server
              due to malformed data
        examples: {}
        description: >-
          Bad Request - The request could not be understood by the server due to
          malformed data
    '404':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Not Found
        examples: {}
        description: Not Found
    '500':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Internal Server Error - A generic error occurred on the server.
        examples: {}
        description: Internal Server Error - A generic error occurred on the server.
  deprecated: false
  type: path
components:
  schemas:
    TokenInfo:
      type: object
      properties:
        chain:
          type: string
          description: The name of the blockchain
        chain_id:
          type: integer
          format: int64
          description: The ID of the blockchain
        symbol:
          type: string
          description: The token symbol
        name:
          type: string
          description: The token name
          nullable: true
        decimals:
          type: integer
          description: The number of decimals for the token
          nullable: true
        price_usd:
          type: number
          format: double
          description: The price of the token in USD
          nullable: true
        total_supply:
          type: string
          description: The total supply of the token
          nullable: true
        market_cap:
          type: number
          format: double
          description: The market capitalization of the token
          nullable: true
        logo:
          type: string
          description: URL to the token logo
          nullable: true

````