# Astro Markdown Experience

A collection of remark plugins designed to improve our markdown processing experience in Astro-based sites. There shouldn't be too much Astro-specific but we haven't had a chance to generealize and test in non-Astro contexts yet.

## Table of Contents

- [Astro Markdown Experience](#astro-markdown-experience)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Remark Plugins](#remark-plugins)
    - [Rewrite Previewable URL](#rewrite-previewable-url)
    - [Rewrite Links](#rewrite-links)
    - [Chart](#chart)
    - [Diagram](#diagram)
    - [Reading Time](#reading-time)
    - [Validate Resources](#validate-resources)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

```bash
pnpm add astro-markdown-experience
```

## Remark Plugins

### Rewrite Previewable URL

Modify URLs to previewable versions for enhanced user experience. This allows
you to preview markdown content directly from the VS Code and automatically
rewrite any URLs to final published versions on build.

For example, if you use `./otherfile.md` in your markdown it will be rewritten
to the published URL like `https://example.com/otherfile`. This allows the local
editing and previewing experience to feel more like the final published version.

```markdown
[VS Code Previewable](./otherfile.md)
```

We want to be able to co-locate images with Markdown during editing so that
they are previewable and convenient to manage. However, during builds of
static sites or apps we want the same images to be available in the `public`
directory so that they can be served as web assets without worrying about
pretty URLs or locations. For example, this should be possible in Markdown:

```markdown
![I'm a Colocated Link](colocated-file-name.jpg)
[Click Colocated Link](colocated-file-name.jpg)
```

When we process remark and publish as SSG (e.g. Astro) we automatically figure
out the location of markdown source file to copy `colocated-file-name.jpg`
into `~/public/x/y/z/colocated-file-name.jpg` where x/y/z is the relative
path of the source.

We also want to be able to store images directly in ~/public but our Markdown
files in `src/*` to be preview-friendly in the CLI and VS Code. For example,
this should be possible in Markdown:

```markdown
![test](../../../public/assets-natural/brand/netspective/knowledge-center/knowledge-center-logo-full-161x35.png)
![try](../../../public/assets-natural/brand/netspective/knowledge-center/knowledge-center-logo-full-161x35.png)
```

When we process using remark and publish as SSG (e.g. Astro) we don't include
the path `/public` because that's just the `dist` folder (in any SSG). So, we
rewrite them dynamically to:

```markdown
![test](/assets-natural/brand/netspective/knowledge-center/knowledge-center-logo-full-161x35.png)
```

By default, location for _relocated files_ is `public/relocated-assets-from-content` 
directory and you should add it to `.gitignore`.

```javascript
import * as ameRPU from "astro-markdown-experience/rewrite-previewable-url";

export default defineConfig({
	markdown: {
		remarkPlugins: [
			ameRPU.typicalRemarkRewritePreviewableURLsPlugin(),
		],
	},
	integrations: [
    ...
```

```javascript
import * as ameRPU from "astro-markdown-experience/rewrite-previewable-url";

export default defineConfig({
	markdown: {
		remarkPlugins: [
			ameRPU.typicalRemarkRewritePreviewableURLsPlugin({
        commonBaseURL: '/otherThanRoot'
      }),
		],
	},
	integrations: [
    ...
```

### Rewrite Links

Transform or modify links within your markdown.

```javascript
import rewriteLinks from 'astro-markdown-experience/rewrite-links';
```

### Chart

Describe the `chart` plugin's functionality, benefits, and use case here.

```javascript
import chart from 'astro-markdown-experience/chart';
```

### Diagram

Describe the `diagram` plugin's functionality, benefits, and use case here.

```javascript
import diagram from 'astro-markdown-experience/diagram';
```

### Reading Time

Estimate the reading time for your markdown content.

```javascript
import readingTime from 'astro-markdown-experience/reading-time';
```

### Validate Resources

Ensure all links and resources in your markdown are valid.

```javascript
import validateResources from 'astro-markdown-experience/validate-resources';
```

## Usage

Provide a more comprehensive guide on how to integrate and use the plugins in various scenarios.

## Contributing

Contributions are welcome! See the [CONTRIBUTING.md](./CONTRIBUTING.md) file for more details.

## License

MIT - see the [LICENSE](./LICENSE) file for details.


<!-- Security scan triggered at 2025-09-02 00:50:00 -->

<!-- Security scan triggered at 2025-09-02 15:48:16 -->