# Changelog

## [0.4.0](https://github.com/KhallilB/kbui/compare/v0.3.0...v0.4.0) (2026-10-23)


### Features

* **react,css:** let mono Badge keep the case of branches and paths ([25768a2](https://github.com/KhallilB/kbui/commit/25768a2a2cd6ab173a1aaf35ac72352e033e1949))
* **react,css:** let mono Badge keep the case of branches and paths ([be49a31](https://github.com/KhallilB/kbui/commit/be49a3181644df6accedee21077606c5ad93d106))

## [0.3.0](https://github.com/KhallilB/kbui/compare/v0.2.0...v0.3.0) (2026-10-23)


### Features

* **react,css:** add Badge, Stat, Progress, Callout, Tooltip, Menu, ScrollArea and Toolbar ([a0fa265](https://github.com/KhallilB/kbui/commit/a0fa265146fd781a35fa65e5467751b44b3718ab))
* **react,css:** add the Task screen primitives ([34d3c75](https://github.com/KhallilB/kbui/commit/34d3c75f648c4db00197b165086d0dd5740ad5e2))
* **tokens,css,react:** let themes tune Progress and Stat, add plain Badge ([5e5c4a5](https://github.com/KhallilB/kbui/commit/5e5c4a5a93674c0037abb373233aaedb1e083712))
* **tokens:** add xs and display text sizes and shared popup tokens ([4e9fb27](https://github.com/KhallilB/kbui/commit/4e9fb27c01b3e000dc9bf70a3180f6646eaaa1fd))

## [0.2.0](https://github.com/KhallilB/kbui/compare/v0.1.0...v0.2.0) (2026-10-23)


### ⚠ BREAKING CHANGES

* **react,css,tokens:** Facet and every Facet* type are now Panel and Panel*; .kb-facet-* classes are .kb-panel-*; --kb-facet-* tokens are --kb-panel-*. v0.1.0 shipped Facet.
* **react,css:** the cut prop and FacetCut type are removed, along with the facet.cut, facet.cut-start, facet.cut-end, facet.corner, facet.cut-edge and facet.seam-active tokens. Shadows use box-shadow syntax.

### Features

* **react,css:** give Facet depth with a shadowed plate and a recessed well ([b5ac1fa](https://github.com/KhallilB/kbui/commit/b5ac1fa00a945939f6d375cd0201a437bdcfb6e3))
* **react,css:** lit facet edges, sunken tone and status chips ([693905a](https://github.com/KhallilB/kbui/commit/693905a05197fff2860cc2815a907a959f9809d3))
* **react,css:** lit facet edges, sunken tone and status chips ([b3e99dd](https://github.com/KhallilB/kbui/commit/b3e99ddec1c492b7d271b7d289e3e8f9921647c1))
* **react,css:** render Facet as a rounded, lit plane with skin-controlled light ([937c062](https://github.com/KhallilB/kbui/commit/937c0624ba61ba298d9a59440b28906dd96dabe4))
* **react,css:** richer Facet geometry, parts and dark contrast ([29b6d76](https://github.com/KhallilB/kbui/commit/29b6d76581add86b7b093e8818ec496515021bc5))
* **react,css:** richer Facet geometry, parts and dark contrast ([e096475](https://github.com/KhallilB/kbui/commit/e0964751ae0515ea6a8563aaec5dd0e53318c38b))


### Bug Fixes

* **css,tokens:** keep Panel glow close to the card and refine its edges ([de66416](https://github.com/KhallilB/kbui/commit/de66416813ef9dda2345cb3aaecbaaddaa016c88))
* **tokens,css:** let a wrapper-scoped --kb-facet-cut change the facet cut ([c7577f8](https://github.com/KhallilB/kbui/commit/c7577f8df3b0f16752e26beb48d1b1f265d6c84c))


### Code Refactoring

* **react,css,tokens:** rename Facet to Panel ([9fea33c](https://github.com/KhallilB/kbui/commit/9fea33c3b93eb7bf0d2ab77562578f8b6105b7c6))

## 0.1.0 (2026-10-22)


### Features

* faceted foundation (tokens, Facet, Status, showcase, decisions 0008-0010) ([0e4de8c](https://github.com/KhallilB/kbui/commit/0e4de8c2e0aae331988498f2a0fb8563d3c9e37b))
* **react,css:** add Facet and Status ([5e2fbc6](https://github.com/KhallilB/kbui/commit/5e2fbc6a46130f2c44798241b9ee462087868ae6))
* release packages in lockstep as GitHub tarballs ([f9a3504](https://github.com/KhallilB/kbui/commit/f9a3504b83b054f054b9ad4bd29c9ce460322890))
* release packages in lockstep as GitHub tarballs ([3c93801](https://github.com/KhallilB/kbui/commit/3c93801b55e47c8ed59508eb1a538ed2483a3596))
* **storybook:** add the faceted skin fixture and the control room showcase ([650b343](https://github.com/KhallilB/kbui/commit/650b343bbd694ec987540563b3594cabb4f920fa))
* **tokens:** add amber, green, teal primitives and info, success, warning, motion, facet and status tokens ([00b9075](https://github.com/KhallilB/kbui/commit/00b9075b08f6b05fe0f797e22bec711cf4f7df20))


### Bug Fixes

* **tokens:** give accent and danger foregrounds a dark value ([820305c](https://github.com/KhallilB/kbui/commit/820305c2eb1f2bb95e2c42eeb5dc5b4e847de36d))


### Continuous Integration

* **release:** install each release on ubuntu, macos and windows ([8617f93](https://github.com/KhallilB/kbui/commit/8617f93309fb54d754ec1f68e1d10b190d925edd))
