# Security

Never commit API keys, tokens, or private configuration. The Azure Speech key
belongs in server-side environment variables. The Gemini key is supplied by
each visitor and should not be logged or stored in the repository.

Do not disclose exploitable vulnerabilities or credentials in a public issue.
Use GitHub's private vulnerability reporting feature when it is enabled, or
GitHub's private abuse-reporting tools for exposed credentials. If a credential
is exposed, its owner should revoke or rotate it through the provider.

The shared Azure function is a basic proxy. Origin validation alone does not
prevent scripted abuse; hosting maintainers should add appropriate rate
limits and monitor resource usage before offering a broad public service.
