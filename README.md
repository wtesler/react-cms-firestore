## react-cms-firestore

Wrap your component in `withCms` to have `props.cms` injected into your components.

CMS data is downloaded from the Firestore.

the second argument to `withCms` defines the CMS entries injected into the component.

Import looks like:

`import {withCms} from "react-cms-firestore";`

Usage often looks like this:

`export default withCms(MyScreen, 'MyScreenData');`

or 

`export default withCms(MyComponent, ['entry1', 'entry2']);`

Then the data can be accessed like:

```
const {cms} = props;
const {footerCms, headerCms} = cms;
const {footerTitle} = footerCms;
const {headerLogoUrl} = headerCms;
...
```

### Placeholder Component

There is a optional third parameter which styles a
default placeholder while the data is loading. It may look like
this:

`export default withCms(MyComponent, 'myCmsData', {width: 200, height:100});`

The possible style values are:
`width`, `height`, `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`

### Initialization

Add a collection called `cms` to your Firestore.
Add a collection called `cms-editor` to your Firestore.

####Security Rules
Users with the role of admin or cmsEditor can update cms.
Everyone can read cms.

Use firebase-roles package to set up initial roles.

```
function isCmsEditor() {
  return request.auth != null 
    && request.auth.token != null 
    && (
    request.auth.token.admin == true || 
    request.auth.token.cmsEditor == true
    );
}

match /cms/{id} {
  allow read: if true;
  allow write: if isCmsEditor();
}

match /cms-editor/{id} {
  allow read: if isCmsEditor();
  allow write: if isCmsEditor();
}
```


The Firestore needs to be initialized in the code before `withCms` is used.

### For Developer

Remember to npm run build before deploying.