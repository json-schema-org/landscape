## JSON Schema Landscape

[![JSON Schema logo - Build more, break less, empower others.](https://raw.githubusercontent.com/json-schema-org/.github/main/assets/json-schema-banner.png)](https://json-schema.org) 

We're thrilled to announce the launch of the JSON Schema Landscape! This comprehensive resource catalogs and organizes the key players in the JSON Schema ecosystem. 

## Explore the Extensive JSON Schema Ecosystem

Visit the deployed website at [https://landscape.json-schema.org/](https://landscape.json-schema.org/) and delve into the rich ecosystem of tools and resources available.

## Run Locally

This section is for those interested in contributing or running the landscape website locally.

**Prerequisites:**

* Install Landscape2 first. Find pre-built versions for your system on the Landscape2 releases page: [https://github.com/cncf/landscape2](https://github.com/cncf/landscape2)

**Building the Website:**

The build process creates the website from data files. Run this command in your terminal:

```bash
landscape2 build \
  --data-file landscape.yml \
  --settings-file settings.yml \
  --guide-file guide.yml \
  --logos-path logos \
  --output-dir build
```

**Running the Website Locally:**

Once built, use Landscape2 to serve the website locally:

```bash
landscape2 serve --landscape-dir build
```

This starts a local server and opens the website in your web browser at http://127.0.0.1:8000. 



## Contributing

* We warmly welcome your contributions to this project!  A dedicated [CONTRIBUTING.md](CONTRIBUTING.md) file outlines the various ways you can get involved, including:
    * Reporting bugs and requesting features
    * Contributing code
    * Improving documentation
    * Adding new entries to the landscape
    * Improving the user interface

## License
The contents of this repository are licensed under either the BSD 3-clause license or the Academic Free License v3.0. See the [license file](https://github.com/json-schema-org/website/blob/main/CONTRIBUTING.md#-license) for more details.


## Contact

 For any questions or feedback, please feel free to open an issue on this repository.

## Get Involved!

 Explore the landscape and see how you can contribute to this evolving space.  Whether through contributions, partnerships, or feedback, your involvement can help shape the future of JSON Schema.

## Connect with the JSON Schema Community

<p align="left">
    <a href="https://json-schema.org/slack" target="blank" style="margin-right: 5px;"><img align="center" src="https://img.icons8.com/color/48/null/slack-new.png" alt="JSON Schema Slack" height="30" width="40" /></a>
    <a href="https://x.com/jsonschema" target="blank" style="margin-right: 5px;"><img align="center" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/450px-X_logo_2023.svg.png" alt="JSON Schema X" height="30" width="40" /></a>
    <a href="https://www.linkedin.com/company/jsonschema" target="blank" style="margin-right: 5px;"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg" alt="JSON Schema LinkedIn" height="30" width="40" /></a>
    <a href="https://www.youtube.com/@JSONSchemaOrgOfficial" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/youtube.svg" alt="JSON Schema YouTube" height="30" width="40" /></a>
</p>
