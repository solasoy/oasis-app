export class TestRequest {
  constructor(
    public url: string,
    public init?: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    }
  ) {}

  async json() {
    return this.init?.body ? JSON.parse(this.init.body) : {};
  }
}

export class TestResponse {
  constructor(
    public body: any,
    public init?: {
      status?: number;
      headers?: Record<string, string>;
    }
  ) {}

  async json() {
    return this.body;
  }
} 