# Changelog

## [0.12.0](https://github.com/KhallilB/kbui/compare/v0.11.0...v0.12.0) (2026-10-31)


### ⚠ BREAKING CHANGES

* **storybook:** The ListDetail recipe renames `initialRequests` to `requests`. The Inbox recipe renames `initialThreads` to `threads`, and `sendReply(id, body)` becomes `commit(id, { body })`. No aliases remain.

### Features

* **react:** add an opaque Panel surface ([19f21e8](https://github.com/KhallilB/kbui/commit/19f21e867d3fc9bea63bf0bc442c7ad159d30f06))
* **react:** add an opaque Panel surface ([96a274d](https://github.com/KhallilB/kbui/commit/96a274d2ee300d1449f99cc837283189d1a13d05))
* **react:** add ConfirmAction ([bc7adb9](https://github.com/KhallilB/kbui/commit/bc7adb99e60f8c6dae1de45d32362fbfbc60f2b6))
* **react:** add ConfirmAction ([96e06dd](https://github.com/KhallilB/kbui/commit/96e06ddcd05ca0ed4ad485e98afb69e8703aeca5))
* **react:** add Dashboard layout intent ([ffd60b8](https://github.com/KhallilB/kbui/commit/ffd60b8f2a53eca2328e3d2a5d9b49d9f1cd7db9))
* **react:** add Dashboard layout intent ([8d9676b](https://github.com/KhallilB/kbui/commit/8d9676b4743ba5795047f61d13832c4f0e8b314e))
* **react:** add Form and Settings layout intents and FormSection ([3b19e50](https://github.com/KhallilB/kbui/commit/3b19e50f7770efb3eaf1f71ed468f9d23af24ffa))
* **react:** add Form and Settings layout intents and FormSection ([#121](https://github.com/KhallilB/kbui/issues/121)) ([dd18c73](https://github.com/KhallilB/kbui/commit/dd18c73f089935ab7c29131e60a35a3b424b88dc))
* **react:** add PageHeader ([ab25a67](https://github.com/KhallilB/kbui/commit/ab25a6740a810f234551dcc6be90e1e391fd0d53))
* **react:** add PageHeader ([47d6d2d](https://github.com/KhallilB/kbui/commit/47d6d2de29452d4eda024ea7d193193a2737f647))
* **react:** add Stack layout component ([2bfed7e](https://github.com/KhallilB/kbui/commit/2bfed7ec11dc865e8c22af9baded8ded472c6b00))
* **react:** add Stack layout component ([7e8fb5c](https://github.com/KhallilB/kbui/commit/7e8fb5ce6df94ac890aafe022f1ce5e49bcf2577))
* **react:** add StatsRow ([cc3ee0a](https://github.com/KhallilB/kbui/commit/cc3ee0acc0bd2afc2c0c5ae6de25120667577cd5))
* **react:** add StatsRow ([24febd1](https://github.com/KhallilB/kbui/commit/24febd1154d425f046bd5d7659d01d10e69e4caa))
* **react:** add SupportingPane layout intent ([32bc655](https://github.com/KhallilB/kbui/commit/32bc655801967c6bad43d52fde2f63b27a8560a6))
* **react:** add SupportingPane layout intent ([f7004bb](https://github.com/KhallilB/kbui/commit/f7004bbcb48107f68745c7c755a5e024a1221f55))
* **react:** add the Gallery layout intent ([d0ba832](https://github.com/KhallilB/kbui/commit/d0ba832ed9fc6c143cb987ca0bcaff0b09086d05))
* **react:** add the Gallery layout intent ([10fa754](https://github.com/KhallilB/kbui/commit/10fa754eff0755523d2afc10641a2bf0371a1e7f))
* **scripts:** add reproducible performance baseline measurement harness ([fb97ab1](https://github.com/KhallilB/kbui/commit/fb97ab1b07328568f0ce22f374517569c396fd68))
* **scripts:** add reproducible performance baseline measurement harness ([657c59a](https://github.com/KhallilB/kbui/commit/657c59aa8f2ab6f1c0d8a4d2fc706009f5aa97fe))
* **scripts:** add reproducible performance baseline measurement harness ([#144](https://github.com/KhallilB/kbui/issues/144)) ([fb97ab1](https://github.com/KhallilB/kbui/commit/fb97ab1b07328568f0ce22f374517569c396fd68))
* **scripts:** add token API inventory diff and compatibility guard ([49a053a](https://github.com/KhallilB/kbui/commit/49a053ac75e7c0859c49f3d0811108786b762166))
* **scripts:** scaffold component reference markdown and author-owned steps ([4896ae0](https://github.com/KhallilB/kbui/commit/4896ae0d5a7a1f7953c33c6b60d2e4eeae154eee))
* **scripts:** scaffold standalone component reference page in new-component ([fa9ee6f](https://github.com/KhallilB/kbui/commit/fa9ee6f9292a656489401b75598c59f8cb654c8b))
* **storybook:** add list-detail workflow recipe ([dcd8d5a](https://github.com/KhallilB/kbui/commit/dcd8d5a7b61cee48660dff46279491458267704f))
* **storybook:** add list-detail workflow recipe ([f7d93db](https://github.com/KhallilB/kbui/commit/f7d93dbfea2195ecf404ede371a86bdfc40fd1d9))
* **storybook:** adopt form primitives ([#176](https://github.com/KhallilB/kbui/issues/176), [#177](https://github.com/KhallilB/kbui/issues/177), [#179](https://github.com/KhallilB/kbui/issues/179)) ([cf10741](https://github.com/KhallilB/kbui/commit/cf107411e28fd3626ff18533295daa99257b2970))
* **storybook:** adopt form primitives in workspace settings ([5708659](https://github.com/KhallilB/kbui/commit/5708659f6bdc25046a38d295903ca74f7d1ba61b))
* **storybook:** adopt shared catalog and playground typography ([fde8c84](https://github.com/KhallilB/kbui/commit/fde8c8405c59b49876dac1ec49a7a378d6221de6))
* **storybook:** adopt shared content page typography ([5effb17](https://github.com/KhallilB/kbui/commit/5effb17f7ac70079ff187b962cb9450d881e2c2e))
* **storybook:** adopt shared site frame primitives ([54c9177](https://github.com/KhallilB/kbui/commit/54c91772e2f2a155e7ed019452c0edc14a80ddb1))
* **storybook:** adopt shared site frame primitives ([0d989cd](https://github.com/KhallilB/kbui/commit/0d989cd564a44c523bf3d13d2470b6a4f1cf886b))
* **storybook:** adopt shared site primitives and typography ([#150](https://github.com/KhallilB/kbui/issues/150), [#151](https://github.com/KhallilB/kbui/issues/151), [#152](https://github.com/KhallilB/kbui/issues/152), [#154](https://github.com/KhallilB/kbui/issues/154)) ([f23a0eb](https://github.com/KhallilB/kbui/commit/f23a0ebd91009e2f713fc44641fe81943f8466f1))
* **storybook:** give list-and-detail recipes shared seams and live data ([62cbe6d](https://github.com/KhallilB/kbui/commit/62cbe6db274c8f3aad390be470e0a2f54fa19064))
* **storybook:** preserve Inbox and recipe workflow contracts ([8cf5840](https://github.com/KhallilB/kbui/commit/8cf5840810108322c5b8b3d902f071b4a08ba028))
* **storybook:** preserve Inbox and recipe workflow contracts ([#145](https://github.com/KhallilB/kbui/issues/145)) ([7cfef7f](https://github.com/KhallilB/kbui/commit/7cfef7f7fa710c53d79042e02ab5f3d591250b3b))
* **storybook:** track adoption across all 63 components ([85fca8b](https://github.com/KhallilB/kbui/commit/85fca8bbb384a3ce1faf68672085adf40e23aa7f))
* **storybook:** track adoption across all 63 components ([3d1617b](https://github.com/KhallilB/kbui/commit/3d1617bff1483b01bbb088c9c9958fb5fcc17b3b))
* **storybook:** unify component and recipe references ([693a790](https://github.com/KhallilB/kbui/commit/693a790515e18d38364b2d89dabc7641ba07511f))
* **storybook:** unify component and recipe references ([fb3baa7](https://github.com/KhallilB/kbui/commit/fb3baa766140cce4fe43cceab226c28e10f04414))
* **tokens:** add public token API inventory and compatibility check ([b98b0ce](https://github.com/KhallilB/kbui/commit/b98b0cec9d1ec8c767874f0ba49f1f95b8647f27))
* **tokens:** validate mode-specific token alias cycles ([7d5431f](https://github.com/KhallilB/kbui/commit/7d5431f54f8df8de631755bb14e2600a01fc9c04))
* **tokens:** validate mode-specific token alias cycles ([f39a511](https://github.com/KhallilB/kbui/commit/f39a511fb7749385ebee3940cdc9415b9d21df54))
* **tokens:** validate mode-specific token alias cycles ([#141](https://github.com/KhallilB/kbui/issues/141)) ([7d5431f](https://github.com/KhallilB/kbui/commit/7d5431f54f8df8de631755bb14e2600a01fc9c04))
* **tokens:** validate token kinds, CSS value syntax, and alias compatibility ([7fb7912](https://github.com/KhallilB/kbui/commit/7fb7912814ba97ed403f870904dc603e6a0c2310))
* **tokens:** validate token value syntax and alias type compatibility ([72aff4b](https://github.com/KhallilB/kbui/commit/72aff4b65befefb1586cd769a5cd1dc0eb6fd2d8))


### Bug Fixes

* **ci:** allow time for performance-report integration test ([884944c](https://github.com/KhallilB/kbui/commit/884944c268538123f78a77ecac9931562cd49f52))
* **ci:** allow time for performance-report integration test ([#167](https://github.com/KhallilB/kbui/issues/167)) ([29d43bf](https://github.com/KhallilB/kbui/commit/29d43bf783021000937519ee8243460eaf326a4b))
* **ci:** run production browser validation stages independently ([a800e83](https://github.com/KhallilB/kbui/commit/a800e83ff0a1e6d83f2dc419024870fec9a60618))
* **ci:** run production browser validation stages independently ([#168](https://github.com/KhallilB/kbui/issues/168)) ([e3a3673](https://github.com/KhallilB/kbui/commit/e3a367332d9cbb4a591df2d27ec1deb836890696))
* **css:** collapse explicit Grid columns on the grid's own width ([9d21f9e](https://github.com/KhallilB/kbui/commit/9d21f9e27a3df20772dca59495d09c1b0668da65))
* **css:** collapse Grid on its own width and add layout placement contracts ([e510cce](https://github.com/KhallilB/kbui/commit/e510cce75437afba3412333acae8af3e88696e75))
* **css:** drop the Status chip dot when an icon is given ([8ed96d2](https://github.com/KhallilB/kbui/commit/8ed96d2a4d45c9bf2acdda0afcfe1a9cc7ceeae3))
* **css:** drop the Status chip dot when an icon is given ([a0361d0](https://github.com/KhallilB/kbui/commit/a0361d06f80497d541b2ce0e46b6c5c19a2a6356))
* **css:** end-align Callout actions ([b1d3335](https://github.com/KhallilB/kbui/commit/b1d333525173318d2130573c3f55243e9f334caa))
* **css:** end-align Callout actions and stack vertical Tabs, with form and feedback placement contracts ([865d73d](https://github.com/KhallilB/kbui/commit/865d73dd80ee8edcfa882bfa08a24651a128d537))
* **css:** end-align Callout actions and stack vertical Tabs, with form and feedback placement contracts ([#139](https://github.com/KhallilB/kbui/issues/139)) ([865d73d](https://github.com/KhallilB/kbui/commit/865d73dd80ee8edcfa882bfa08a24651a128d537))
* **css:** end-align Panel's lone toggle and Toast's action ([dcf1553](https://github.com/KhallilB/kbui/commit/dcf155322502a207b3d4a098e2daf4ec72f4ac92))
* **css:** give cards compact padding in narrow containers ([c0e8be4](https://github.com/KhallilB/kbui/commit/c0e8be47b77a0295f4577be1fa95ffdbd3f3c966))
* **css:** keep Collection words whole and its actions at the end ([1edc812](https://github.com/KhallilB/kbui/commit/1edc812d8b026b32696bbeda97b024f987f41e33))
* **css:** keep CollectionRow status and actions on one end-aligned line ([20bf699](https://github.com/KhallilB/kbui/commit/20bf69987c8f2e9f867a3c06cf45f5a31913873b))
* **css:** keep CollectionRow status and actions on one end-aligned line, with row placement contracts ([950ce6a](https://github.com/KhallilB/kbui/commit/950ce6a6c1e1cab9d91455be873b5f376d206ed6))
* **css:** keep table words whole and Collection actions at the end, with data placement contracts ([a33f604](https://github.com/KhallilB/kbui/commit/a33f604082a8ca2ffba6e9d03a870b111d66c09b))
* **css:** keep whole words in Table headings and cells ([17a5675](https://github.com/KhallilB/kbui/commit/17a56755d9728680eea6e1437c834edf77031f79))
* **css:** place surface actions and card padding by container, with surface placement contracts ([e23adbd](https://github.com/KhallilB/kbui/commit/e23adbd86b26e429bf9d99f3043751111a8d2b0a))
* **css:** stack vertical Tabs below 48rem of their width ([eb7b972](https://github.com/KhallilB/kbui/commit/eb7b972f15f2e5d67dfc2c15dfcee16715f6b457))
* **experiments:** state that the M2 gate reads rule output ([8282234](https://github.com/KhallilB/kbui/commit/8282234e55a779c2cafadd4a669102ce5bc97c17))
* keep list item spacing within component layouts ([29c4a69](https://github.com/KhallilB/kbui/commit/29c4a693f70597ccc4f9b48389c0af0c2c96980a))
* **m2:** state that the gate reads rule output ([4df1fec](https://github.com/KhallilB/kbui/commit/4df1fec981296259d20bdbab160a9db162aada26))
* prevent prose margins from shifting component lists ([11d99a3](https://github.com/KhallilB/kbui/commit/11d99a38b66abc7b83222da599cf6ce5704412cf))
* **react:** keep intent geometry fixtures inside catalog previews ([405558d](https://github.com/KhallilB/kbui/commit/405558ddd3c65fc063d470108d43341906ad262f))
* **react:** place M3 header, section and row actions by contract ([f79114e](https://github.com/KhallilB/kbui/commit/f79114eef58f4a0099a3bf0e0ae58ce2aea6ddc8))
* **react:** run wide intent checks and keep focus during section saves ([6351e9f](https://github.com/KhallilB/kbui/commit/6351e9fcf6a205f28155852a4e90f32da4e0b7c7))
* **scripts:** emit kbui.components layer and sort layered CSS imports ([9aa996a](https://github.com/KhallilB/kbui/commit/9aa996a0f2e4bb4689132f110419d76fe471003d))
* **scripts:** emit kbui.components layer and sort layered CSS imports ([899113d](https://github.com/KhallilB/kbui/commit/899113d87d44a06cb2acd6254e807df8cc2c8d3f))
* **scripts:** emit kbui.components layer and sort layered CSS imports ([#142](https://github.com/KhallilB/kbui/issues/142)) ([9aa996a](https://github.com/KhallilB/kbui/commit/9aa996a0f2e4bb4689132f110419d76fe471003d))
* **storybook:** align live styling anatomy and portal cleanup ([79a5121](https://github.com/KhallilB/kbui/commit/79a5121bdd77942411cd856055e4db27297e906a))
* **storybook:** align live styling anatomy and portal cleanup ([ebafebb](https://github.com/KhallilB/kbui/commit/ebafebb1266a2534d9ef860d5d58de82c6d0852b))
* **storybook:** close list-and-detail flow gaps ([#166](https://github.com/KhallilB/kbui/issues/166)) ([47e0967](https://github.com/KhallilB/kbui/commit/47e0967cea6fa1c4ba16f5b0a0e65582a725900f))
* **storybook:** close list-and-detail flow gaps in ListDetail and Inbox ([47e0967](https://github.com/KhallilB/kbui/commit/47e0967cea6fa1c4ba16f5b0a0e65582a725900f))
* **storybook:** close list-and-detail flow gaps in ListDetail and Inbox ([424141d](https://github.com/KhallilB/kbui/commit/424141d2fcd984d1bbbaa103c7a9b98f9a12c535))
* **storybook:** copy complete styling examples for all components ([9a72431](https://github.com/KhallilB/kbui/commit/9a724310dc90f7f07bf79f11206dbabf53a20789))
* **storybook:** copy complete styling examples for all components ([fd2922e](https://github.com/KhallilB/kbui/commit/fd2922e39144967b9306bfb8f617e230eb32d614))
* **storybook:** keep PageHeader out of the Status catalog search ([93450b4](https://github.com/KhallilB/kbui/commit/93450b40ff8bd6902ad0c4ec79eebd044fee4bfe))
* **storybook:** preserve all four maintained recipes ([b7d2e78](https://github.com/KhallilB/kbui/commit/b7d2e7864c2d6f5e6354556c5183c164ef913b8a))
* **storybook:** preserve all four maintained recipes ([c99b12b](https://github.com/KhallilB/kbui/commit/c99b12bbe6a3beb446c5a3e9e06c1f8d11397a57))
* **storybook:** preserve rendered source whitespace ([7ad16cb](https://github.com/KhallilB/kbui/commit/7ad16cb62dc8d2e2653ce735c8044c76a8eb18e4))
* **storybook:** reconcile styling examples and live previews ([#147](https://github.com/KhallilB/kbui/issues/147), [#149](https://github.com/KhallilB/kbui/issues/149)) ([76dd47e](https://github.com/KhallilB/kbui/commit/76dd47ed9c8885d98651ac75054775c84644b52b))
* **storybook:** streamline component code editors ([8a3be32](https://github.com/KhallilB/kbui/commit/8a3be327a317c06fdbfa946f803feaf0add053ea))
* **storybook:** streamline component code editors ([ba45ad2](https://github.com/KhallilB/kbui/commit/ba45ad248dab84f949dd8c8aa771f6a324b96161))


### Performance Improvements

* **storybook:** bound Shiki highlight cache with LRU eviction ([0629ad3](https://github.com/KhallilB/kbui/commit/0629ad32f2cae69ef7f667bd7ab7b98f43b32bec))
* **storybook:** bound Shiki highlight cache with LRU eviction ([82c03ba](https://github.com/KhallilB/kbui/commit/82c03ba7ed95dab52b356d16eb6735f156bcf26d))


### Documentation

* align breadcrumbs and validate narrow references ([6931c55](https://github.com/KhallilB/kbui/commit/6931c55e13945dd047410260ca3cbae15f4741ee))
* complete inline code formatting audit ([da758a2](https://github.com/KhallilB/kbui/commit/da758a2dc239620282e25d14c4d20579f7b9241c))
* define recipes and their contribution routes ([d786d50](https://github.com/KhallilB/kbui/commit/d786d5000e5f54b474ee26c1fb77e74cd9d58371))
* define recipes and their contribution routes ([7bd6ed6](https://github.com/KhallilB/kbui/commit/7bd6ed69dc6d4465c746f8286c7da5330ab41f93))
* format remaining attribute references ([ea168fa](https://github.com/KhallilB/kbui/commit/ea168fadaa32fc216b20dfec6723190833549fbf))
* generate recipe guarantees, policy and file lists from the catalog ([84688ec](https://github.com/KhallilB/kbui/commit/84688ec06f121f4621e5ef5f5cc6dfed5b649382))
* generate recipe guarantees, policy and file lists from the catalog ([f5137d0](https://github.com/KhallilB/kbui/commit/f5137d0f1e7795e4b409b1562071c0b5d187666e))
* **m2:** align gate comment with the roadmap's gate rows ([f303d2b](https://github.com/KhallilB/kbui/commit/f303d2bbc4d99f1623f9b3c74f9d7d30bb3d5580))
* **m2:** align gate comment with the roadmap's gate rows ([1380baa](https://github.com/KhallilB/kbui/commit/1380baa91598b382975f468588354d8551d6ab93))
* move recipe guides to the shared template ([230b42a](https://github.com/KhallilB/kbui/commit/230b42ae052ddf2218fc705fd5ba300903727495))
* move recipe guides to the shared template ([da3e03b](https://github.com/KhallilB/kbui/commit/da3e03b4a74ab9f49a1f94efa0a5e5c3292a4cc5))
* point the components guide at the workspace demo ([0a3303b](https://github.com/KhallilB/kbui/commit/0a3303b350b7b36b1826ad6c067ad24d2f80b8a4))
* point the components guide at the workspace demo ([2362aa0](https://github.com/KhallilB/kbui/commit/2362aa0212001b6aa90f4f721708eccb3e8712c3))
* scope the recipe guide template to flow recipes ([9e22ad4](https://github.com/KhallilB/kbui/commit/9e22ad4794946b30303ee01ab0f87b73559501ed))
* scope the recipe guide template to flow recipes ([e6a63b0](https://github.com/KhallilB/kbui/commit/e6a63b09100162983dbc812273bd71d6d5635415))
* **storybook:** describe preserved recipe URL checks accurately ([be6bcb2](https://github.com/KhallilB/kbui/commit/be6bcb29b016e8381c23509e1506930929853a6d))
* **tokens:** clarify CSS-native DTCG-inspired format and validation guarantees ([9ecaab9](https://github.com/KhallilB/kbui/commit/9ecaab925c0d028a09b140b42b23f0b794244836))
* **tokens:** clarify CSS-native format and validation guarantees ([ed416a0](https://github.com/KhallilB/kbui/commit/ed416a0815560b360c8f64a595d18e82d8e3a645))
* unify documentation language and inline code formatting ([b501c41](https://github.com/KhallilB/kbui/commit/b501c41bd4d0afa9377b0ed8f93b2cb035f26caf))
* unify documentation language and inline code formatting ([0dceec0](https://github.com/KhallilB/kbui/commit/0dceec09ace2db004be74bcad6dff18d169fd2af))
* unify documentation language and inline code formatting ([#138](https://github.com/KhallilB/kbui/issues/138)) ([b501c41](https://github.com/KhallilB/kbui/commit/b501c41bd4d0afa9377b0ed8f93b2cb035f26caf))

## [0.11.0](https://github.com/KhallilB/kbui/compare/v0.10.4...v0.11.0) (2026-10-30)


### Features

* add collection workflow components and contracts ([0fb0850](https://github.com/KhallilB/kbui/commit/0fb0850ed35307a7d48b7687724616268897e440))
* add collection workflow components and contracts ([d8237a7](https://github.com/KhallilB/kbui/commit/d8237a7f89f20aefa9ac48bbb988e1c5e4fb5140))
* add editorial media catalog and avatar silhouettes ([065e743](https://github.com/KhallilB/kbui/commit/065e743549fc87784cfc5745412ee21150faa5f4))
* add media and identity components ([7abcca0](https://github.com/KhallilB/kbui/commit/7abcca08dd32a981ba122a654ad53557b3b487a4))
* add media and identity components with editorial catalog ([e9f53f9](https://github.com/KhallilB/kbui/commit/e9f53f92d314f2aafe160acc5d1d3f3ce6af56ce))
* **css:** use full tone ink on callout titles and opaque surface mix ([96e6e37](https://github.com/KhallilB/kbui/commit/96e6e3744304c7e065124517a3cbb10818c401ad))
* **feedback:** add EmptyState, Spinner, Skeleton, and loading recipes ([c5ff9c6](https://github.com/KhallilB/kbui/commit/c5ff9c69dfcfb94cb0afa52e486aabc8b0b84ea7))
* **loading:** add expressive Spinner variants and Skeleton animation modes ([c501a78](https://github.com/KhallilB/kbui/commit/c501a780f11e8804b1f8fd3a64b3538868733ee7))
* **react:** add accessible Tabs component ([20ab9be](https://github.com/KhallilB/kbui/commit/20ab9be907bc4461f37a25233a41c004d289f9ea))
* **react:** add accessible Tabs component ([03ec539](https://github.com/KhallilB/kbui/commit/03ec539f6a04757cb98f9f0abc6de55292143beb))
* **react:** add collapsible height transition and stable Code action widths ([fba810b](https://github.com/KhallilB/kbui/commit/fba810b323984b9d8e2cfdf1a53d582df4f88806))
* **react:** add composable Toast manager ([6d98f70](https://github.com/KhallilB/kbui/commit/6d98f70aa762d06c263237251cb1051f26b0dcc5))
* **react:** add composable Toast manager ([3811650](https://github.com/KhallilB/kbui/commit/38116501b60f43869a0942fea9637813e6787be9))
* **react:** add copyable content patterns and automatic highlighting ([88e58a2](https://github.com/KhallilB/kbui/commit/88e58a24d52e53222aaa8b28ef84eab3a11fadbd))
* **react:** add CopyableText and CodeBlock ([7db99ee](https://github.com/KhallilB/kbui/commit/7db99ee8d7ef918be50a686290b6f7bddee43b1e))
* **react:** add disclosure and overlay components ([8528933](https://github.com/KhallilB/kbui/commit/8528933cc6d95bed389ef491e6f6bc30bf4354ed))
* **react:** add disclosure and overlay components ([b4eaf61](https://github.com/KhallilB/kbui/commit/b4eaf618b80426da0eb57b84718e942a388be976))
* **react:** add EmptyState, Spinner, Skeleton and Toast with async feedback recipes ([116e1c7](https://github.com/KhallilB/kbui/commit/116e1c705dc9ea86b4d3b21ccb57101c253cf306))
* **react:** add Grid layout options and reset list chrome ([b2e5d3a](https://github.com/KhallilB/kbui/commit/b2e5d3a1fe789c37f00ab87d6eb5b3d68469a372))
* **react:** add Grid layout options and reset list chrome ([09e82eb](https://github.com/KhallilB/kbui/commit/09e82ebdc11b66f60d3a31e0ff712f87c48c5fa2))
* **react:** add Link.Provider router seam ([2a12ecf](https://github.com/KhallilB/kbui/commit/2a12ecfbaf1ba00a4ac67fad6dcc1be6f04bc447))
* **react:** add Link.Provider router seam for Link and Button href ([43db186](https://github.com/KhallilB/kbui/commit/43db186acc1941b4308aba4cdeb48a709cb86179))
* **react:** add minLines and collapsedLines to Code ([86c89b2](https://github.com/KhallilB/kbui/commit/86c89b25805906aa2c57c76924438fb9e84f3725))
* **react:** add multiple selection to Combobox ([2886901](https://github.com/KhallilB/kbui/commit/28869012a5cf9e7b412f38a09bf7393baa222138))
* **react:** add multiple selection to Combobox ([8f8baad](https://github.com/KhallilB/kbui/commit/8f8baadb6f343a6785867fe5cd78616c07992a8a))
* **react:** add native structured-data components ([af36359](https://github.com/KhallilB/kbui/commit/af3635957d95211fe5d281631d8f45969fd0bbea))
* **react:** add native structured-data components ([e9a05bd](https://github.com/KhallilB/kbui/commit/e9a05bdc118f53964f93774bf0039dbeca9e1fff))
* **react:** add syntax-highlighted multiline Code blocks ([068b608](https://github.com/KhallilB/kbui/commit/068b6086e83e7b4a60457cf16aca8b79eac88f6f))
* **react:** add syntax-highlighted multiline Code blocks ([dd389d5](https://github.com/KhallilB/kbui/commit/dd389d58d93906e042cafe953bb19e7465228c39))
* **storybook:** add studio focus overlay and elevate theme comparison cards ([12436c0](https://github.com/KhallilB/kbui/commit/12436c0ec6e1203d96bc66f882416e1f9bedc58a))
* **storybook:** add studio focus overlay and elevate theme comparison cards ([ca2178d](https://github.com/KhallilB/kbui/commit/ca2178d0d66e37060a1d8655e4fa83884514f2a7))


### Bug Fixes

* **css:** distinguish selected multi-select options ([6979ab9](https://github.com/KhallilB/kbui/commit/6979ab93aad354f6af69826c5d45adb3c1cdf51f))
* **css:** respect reduced motion in built popover styles ([2566125](https://github.com/KhallilB/kbui/commit/2566125a8c92cd2e0154e49affd1821174568a42))
* **css:** strengthen Callout tone borders, fills, and titles ([529e5a9](https://github.com/KhallilB/kbui/commit/529e5a98c048d5d12a92019078de036bbf312b6e))
* **css:** strengthen Callout tone borders, fills, and titles ([e78a615](https://github.com/KhallilB/kbui/commit/e78a61575a1eea4ba792a9dfefd6b7a5f58ee5bd))
* **css:** strengthen multi-select checkbox contrast ([a59f597](https://github.com/KhallilB/kbui/commit/a59f597c2b7bdcfc4382ee09786b1d2e15df7506))
* preserve avatar shape through image stylesheet cascade ([b06e454](https://github.com/KhallilB/kbui/commit/b06e454c3f859d79fb525306716e7cd00efdabfd))
* **react:** keep filtered multi-select choices open ([81b3ab2](https://github.com/KhallilB/kbui/commit/81b3ab2c8c69e3bc833171161a329d39371bcf79))
* **react:** preserve ComboboxProps extension compatibility ([847b03d](https://github.com/KhallilB/kbui/commit/847b03d76945ab0d1fa41d1c3e869a5e2a85ad0a))
* **react:** preserve unknown fenced code and integrate current components ([a8150b5](https://github.com/KhallilB/kbui/commit/a8150b52c91e0cb72247093a8494321593dc2c81))
* **react:** preserve wrapping for static table headings ([eee8340](https://github.com/KhallilB/kbui/commit/eee8340f4e639edd2622a1e227785f662464dcf9))
* **react:** prevent focus entering closing disclosure panels ([3c59755](https://github.com/KhallilB/kbui/commit/3c5975514762f6540ca568351b312ad30616c23e))
* **react:** refine table heading usability and preserve fixed layouts ([4c58747](https://github.com/KhallilB/kbui/commit/4c58747c6b59f0add33e740f7d86e7b2d958cf1b))
* **storybook:** give root Firefox launches an owned home ([dba398b](https://github.com/KhallilB/kbui/commit/dba398bf647cad184f1e1deb70fafbe0ecc93a17))
* **storybook:** load accessibility guides in native Node ([d9d5656](https://github.com/KhallilB/kbui/commit/d9d5656e2c5f03d91c7d3faf5f115ff73c12abfb))


### Documentation

* **a11y:** make component accessibility guidance actionable ([2167f29](https://github.com/KhallilB/kbui/commit/2167f2909a76571b42ccd3286b0550973b7094f7))
* align overlay command coverage with component stories ([eec8b93](https://github.com/KhallilB/kbui/commit/eec8b93da3c5ee43027ed239e694cbcef0017694))
* define bounded component-family review limits ([e868a93](https://github.com/KhallilB/kbui/commit/e868a93490608f08f0fa0a1539b7bb0664979d3a))
* define bounded component-family review limits ([728974d](https://github.com/KhallilB/kbui/commit/728974d73998177cf7644a755b895421ecac1a16))
* guide component and screen pattern contributions ([1a2c8ea](https://github.com/KhallilB/kbui/commit/1a2c8ead9ebc7dc31fb3f7a9c2a2a22ff225db7f))
* guide component and screen pattern contributions ([5f5f46e](https://github.com/KhallilB/kbui/commit/5f5f46e4d35a8728ecd8ad6869bbededce99788a))
* **react:** organize component references and accessibility guidance ([9dff98e](https://github.com/KhallilB/kbui/commit/9dff98e7ff28326fb10ada636f7c45742f44d6e6))
* **react:** split component references into focused guides ([82cde43](https://github.com/KhallilB/kbui/commit/82cde43625aed2ab11139b0ec38f8385b9bdfcb1))
* restore the feature map table header ([1d13ec1](https://github.com/KhallilB/kbui/commit/1d13ec1f4ae998947dcd5e0e607869cda7959c20))
* scope overlay verification claims to component stories ([b525ceb](https://github.com/KhallilB/kbui/commit/b525cebc2160893833661007674544c4ee210a82))

## [0.10.4](https://github.com/KhallilB/kbui/compare/v0.10.3...v0.10.4) (2026-10-29)


### Bug Fixes

* **release:** keep published READMEs and documentation releases in sync ([118f274](https://github.com/KhallilB/kbui/commit/118f2743438d49fa6a4d0102179966280c92acc4))
* **release:** verify npm READMEs and prepare documentation releases ([9283935](https://github.com/KhallilB/kbui/commit/9283935ab8a8c3a1597d8dd0cecc04389427ee70))

## [0.10.3](https://github.com/KhallilB/kbui/compare/v0.10.2...v0.10.3) (2026-10-29)


### Documentation

* **release:** document npm README publication ([0323767](https://github.com/KhallilB/kbui/commit/0323767243db77af9caf85a58a5a05990f8063be))

## [0.10.2](https://github.com/KhallilB/kbui/compare/v0.10.1...v0.10.2) (2026-10-28)


### Bug Fixes

* **release:** publish local tarballs and safely retry releases ([b26e839](https://github.com/KhallilB/kbui/commit/b26e8394758a7d604a6880680c5ff3eb305fbeff))
* **release:** publish local tarballs and safely retry releases ([80a5f95](https://github.com/KhallilB/kbui/commit/80a5f957b44a42a8a9d7cf0b3bf67fc4ab8990bc))

## [0.10.1](https://github.com/KhallilB/kbui/compare/v0.10.0...v0.10.1) (2026-10-28)


### Bug Fixes

* **release:** keep public notes complete across version bumps ([b4f9ee5](https://github.com/KhallilB/kbui/commit/b4f9ee53497329bd45d00e283896e5c9a413e488))

## [0.10.0](https://github.com/KhallilB/kbui/compare/v0.9.1...v0.10.0) (2026-10-28)


### ⚠ BREAKING CHANGES

* Replace @kbui package imports and dependencies with the matching @kb.ui packages and keep package versions synchronized.

### Features

* publish packages under the [@kb](https://github.com/kb).ui npm scope ([b7d6546](https://github.com/KhallilB/kbui/commit/b7d6546919fb065138cee69bbb9d8bac9c29b298))
* publish releases to npm with trusted publishing ([99fec62](https://github.com/KhallilB/kbui/commit/99fec62bdae66f5d96465668fd7209ab873bcb6d))


### Bug Fixes

* **components:** align aria-invalid, css states, and catalog contracts ([b4f7765](https://github.com/KhallilB/kbui/commit/b4f77650fe43f02a83b80ced454572a87aded5d6))
* **release:** keep legacy scope installs usable during npm rollout ([a63dfd6](https://github.com/KhallilB/kbui/commit/a63dfd699e43a6010aa6fc76766c30fe7dbed742))

## [0.9.1](https://github.com/KhallilB/kbui/compare/v0.9.0...v0.9.1) (2026-10-28)


### Bug Fixes

* **site:** restore release notes and dark editor selection ([1babe07](https://github.com/KhallilB/kbui/commit/1babe0721c6fc51f4625c709f9430a23ba01d2aa))
* **site:** restore release notes and dark editor selection ([ffbc6ab](https://github.com/KhallilB/kbui/commit/ffbc6ab98afcf64c7486f3fd5bbcb4ba7ad0af4d))
* **site:** restore release notes and dark editor selection ([#75](https://github.com/KhallilB/kbui/issues/75)) ([1babe07](https://github.com/KhallilB/kbui/commit/1babe0721c6fc51f4625c709f9430a23ba01d2aa))

## [0.9.0](https://github.com/KhallilB/kbui/compare/v0.8.0...v0.9.0) (2026-10-28)


### Features

* **catalog:** add commented CSS and Tailwind starters ([26d2991](https://github.com/KhallilB/kbui/commit/26d2991bba51cc89d2e7760673bcb01630290440))
* **catalog:** make component examples editable ([ff30c42](https://github.com/KhallilB/kbui/commit/ff30c4215137411760290845784891eb880f8af3))
* **catalog:** make component examples editable ([01d201e](https://github.com/KhallilB/kbui/commit/01d201e254d018b88118f82bb1a79973eb120ce9))
* **ci:** comment Storybook preview links on pull requests ([b5fc15e](https://github.com/KhallilB/kbui/commit/b5fc15ea3fca63c1aa585a014debbb5413b6becf))
* **ci:** link changed stories in PR previews ([9c5ee91](https://github.com/KhallilB/kbui/commit/9c5ee913f56778a3ccdbf6b34fe1ddf7133ff5bd))
* **ci:** publish per-PR Storybook previews ([738fe74](https://github.com/KhallilB/kbui/commit/738fe74bc5a800d8572640dd16afb41b83ececd0))
* **forms:** add compact Switch sizing, Fieldset sm default, and bilateral on/off tones ([b52e1b0](https://github.com/KhallilB/kbui/commit/b52e1b00c1c81ceca0e09a7a7ad339030287ffcd))
* improve segmented controls, examples, and theme consistency ([2e5f0dc](https://github.com/KhallilB/kbui/commit/2e5f0dc05777af16f2dd9392833a4d4d6212e440))
* **react:** add basic form primitives ([934df69](https://github.com/KhallilB/kbui/commit/934df69e6f4aa1209a111e6c590860b429206093))
* **react:** add basic form primitives ([22451df](https://github.com/KhallilB/kbui/commit/22451df05b14ed506dacd5c8b81fcc90610d4ce8))
* **react:** add Combobox and MultiSelect search and selection components ([c271207](https://github.com/KhallilB/kbui/commit/c27120725962434a497eaa0e57d4079f6f1b4625))
* **react:** add Combobox and MultiSelect search and selection components ([f963cec](https://github.com/KhallilB/kbui/commit/f963cecab4f03108ac08b0083fa1648677df2317))
* **react:** add native typography primitives ([4ddeaa5](https://github.com/KhallilB/kbui/commit/4ddeaa59af4107ed566b7e714e1c2c6091609286))
* **react:** add resizable Panel.Handle ([cb4f7e3](https://github.com/KhallilB/kbui/commit/cb4f7e3bed295e299f1c192eaf761d7c25a8036b))
* **react:** add resizable Panel.Handle ([f588633](https://github.com/KhallilB/kbui/commit/f5886339b4d4bbff3543e6c59b99fc4e302c41c0))
* **react:** add responsive layout primitives ([#70](https://github.com/KhallilB/kbui/issues/70)) ([f3ab30b](https://github.com/KhallilB/kbui/commit/f3ab30b52d15852ec1e9ab39eefc11b2091ce6a6))
* refine segmented controls, examples, and theme consistency ([454861f](https://github.com/KhallilB/kbui/commit/454861ff5f7bbe9665c6642ed664be5e54e0cb88))
* **site:** improve component examples and responsive navigation ([#67](https://github.com/KhallilB/kbui/issues/67)) ([11afd63](https://github.com/KhallilB/kbui/commit/11afd63900ccbc88180ebf9aef4bc0ec3638b5ec))
* **site:** integrate typography and PR Storybook previews ([b56a218](https://github.com/KhallilB/kbui/commit/b56a218d7cdfdc4208834d23aba7ad7b7cbf5708))
* **site:** integrate typography catalog and guides ([c50645e](https://github.com/KhallilB/kbui/commit/c50645ec811af8a571273537424153098fa97e3c))


### Bug Fixes

* **catalog:** unify styling editor presentation ([9712f8b](https://github.com/KhallilB/kbui/commit/9712f8b807c8981f83bd6a0e24c08547abef069f))
* **ci:** grant PR permission for preview comments ([2c6985a](https://github.com/KhallilB/kbui/commit/2c6985a3b945b08e8eb98eb156c4dffaf50df1e8))
* **docs:** render nested typography tokens safely ([cf01141](https://github.com/KhallilB/kbui/commit/cf01141e04624640cffe146217ca427d10bd0339))
* **tokens:** preserve inline link contrast across themes ([95ca739](https://github.com/KhallilB/kbui/commit/95ca739470d9559622bd95e7ba0c57891752a280))

## [0.8.0](https://github.com/KhallilB/kbui/compare/v0.7.0...v0.8.0) (2026-10-27)


### Features

* refresh default palette, card depth and documentation site ([300bf5b](https://github.com/KhallilB/kbui/commit/300bf5b46cabde8be177618ab65a2550eeef13a0))
* **tokens:** add visualization role tokens ([#61](https://github.com/KhallilB/kbui/issues/61)) ([566fbe8](https://github.com/KhallilB/kbui/commit/566fbe819d18596cd2dc0c6bb9a718fa2961dde3))

## [0.7.0](https://github.com/KhallilB/kbui/compare/v0.6.0...v0.7.0) (2026-10-27)


### Features

* **css:** expose surface material and motion tokens ([a26b11c](https://github.com/KhallilB/kbui/commit/a26b11c4884a789489d846332aa39b20dbaca9ca))
* **react:** support structured themed overlays ([098289c](https://github.com/KhallilB/kbui/commit/098289ce80d442605527b836395bb070b9ed8217))
* **site:** add changelog page and latest-release pill ([#55](https://github.com/KhallilB/kbui/issues/55)) ([4cfbbc7](https://github.com/KhallilB/kbui/commit/4cfbbc7853e5048a9bbb03143a7c02a55c7345d6))
* **site:** unify catalog and QA on kbui 0.6.0 ([#51](https://github.com/KhallilB/kbui/issues/51)) ([6cf405c](https://github.com/KhallilB/kbui/commit/6cf405c0110cab3fa00dca1116713cccccd4e777))


### Bug Fixes

* **css:** keep Button text legible in forced colors ([047c3ae](https://github.com/KhallilB/kbui/commit/047c3aec6e147f72beef5ce977257f6f6d27c7b5))
* restyle kbui with plain classes, tokens or Tailwind; ship styles.css in @kbui/react ([#54](https://github.com/KhallilB/kbui/issues/54)) ([828a06c](https://github.com/KhallilB/kbui/commit/828a06c48d84f323585900a5114da597d487f3a4))
* **site:** restore deployed previews and reuse landing controls ([#56](https://github.com/KhallilB/kbui/issues/56)) ([d7ddde8](https://github.com/KhallilB/kbui/commit/d7ddde8dbef49ee3a1b56c42afa0d3f015e3561e))

## [0.6.0](https://github.com/KhallilB/kbui/compare/v0.5.0...v0.6.0) (2026-10-26)


### Features

* **catalog:** add bounded preview document cache ([7db681d](https://github.com/KhallilB/kbui/commit/7db681d3c0115e1cb509f9a8783efda37f812f11))
* **catalog:** add focused live component browser ([57c6081](https://github.com/KhallilB/kbui/commit/57c60817cc04e49f2f8848d7a2e549df95c3eea3))
* **react:** add controlled tactile Checkbox ([dd62f9a](https://github.com/KhallilB/kbui/commit/dd62f9a9b7e80758161dee263b85766850e0926d))
* **react:** add controlled tactile Select ([e861ec8](https://github.com/KhallilB/kbui/commit/e861ec84bc81bc030e96fb719a6d61b241741d63))
* **react:** add controlled tactile Switch ([b32e2b3](https://github.com/KhallilB/kbui/commit/b32e2b34f7b504ec603329f1fe8116f425797598))
* **react:** add Input adornments and search recipe ([3f7ce63](https://github.com/KhallilB/kbui/commit/3f7ce6312d4e4e28b063ed439316b1b9fefccfb5))
* **react:** add NumberField and FileInput ([605a599](https://github.com/KhallilB/kbui/commit/605a5997b4f39b2fd48a12dab222c1e9881083bb))
* **react:** add tactile RadioGroup with segmented appearance ([a7e4b52](https://github.com/KhallilB/kbui/commit/a7e4b522ef77c2b209c4f1c23900ddb11d951508))
* ship tactile default design and themed previews ([23ec550](https://github.com/KhallilB/kbui/commit/23ec550d37e3a6036c316d595cec6b4e50b207cd))
* **site:** add kbui home, catalog, setup and deployment ([a269e34](https://github.com/KhallilB/kbui/commit/a269e34ce9ceaba9533748eca0da576c046a08d9))
* **site:** deploy kbui on its own custom domain ([8c95fa1](https://github.com/KhallilB/kbui/commit/8c95fa183271204786af62d753dbed2dc79645d5))
* **site:** polish landing navigation and interactive day demo ([9217e1c](https://github.com/KhallilB/kbui/commit/9217e1c7a3a233abab1911c6116d79a132e086f8))


### Bug Fixes

* **catalog:** preserve legacy Input recipe links ([3c719af](https://github.com/KhallilB/kbui/commit/3c719af6fccad40979f65d0ce4f3a926fca943ef))
* **catalog:** retain preview documents across state changes ([1b20426](https://github.com/KhallilB/kbui/commit/1b2042621961808c74f08df80af7f110f2317e93))
* **ci:** install Bun with image-provided npm ([95e4584](https://github.com/KhallilB/kbui/commit/95e45848a4da01f347420abbb05c8871ec48fec8))
* **react:** keep focus compact and respect menu input mode ([0924351](https://github.com/KhallilB/kbui/commit/092435110bffa53d15bcee1d0a4c74972a189be3))
* **react:** recover selected radio keyboard entry ([11d7fbc](https://github.com/KhallilB/kbui/commit/11d7fbc9271e6b4a7712c1ac6cc2acba4e7d2da1))
* **site:** keep preview navigation out of catalog history ([c07c550](https://github.com/KhallilB/kbui/commit/c07c5508f508b53f0ea5a46bd7c60fe7b4a4e0b3))
* **test:** preserve preview canvas and await route cleanup ([a2e1641](https://github.com/KhallilB/kbui/commit/a2e16410fafa3172c17da98cd9e9d142386464ba))

## [0.5.0](https://github.com/KhallilB/kbui/compare/v0.4.0...v0.5.0) (2026-10-23)


### Features

* add neutral Card and Grid with consumer version guard ([64c499a](https://github.com/KhallilB/kbui/commit/64c499a65f81f27b5d696880ce27f2d5f2fc2125))


### Bug Fixes

* validate consumer versions through symlinked CLI paths ([7d77277](https://github.com/KhallilB/kbui/commit/7d772774e010b1b4f6f63d1879ee93ca5a24b209))

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
