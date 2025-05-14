# next-client-utils

> 🧩 Utilities to bridge server and client components seamlessly in Next.js apps.

---

## ✨ Features

- 🖱️ **Interactive popups**: Trigger popups on click or hover for any element.
- ⚛️ **SSR-friendly**: Keep elements server-side rendered while using `WithPopup`.
- 🌐 **Server-side popup rendering**: Dynamically generate popup content via `renderSSRPopUp`.
- 🎯 **Customizable positioning**: Fine-tune popup placement using flexible props.
- 🪝 **Essential React hooks**: Includes `useOutsideClick`, `useElementPositionChange`, and more.
- 🌀 **Debounce utility**: Built-in and fully customizable debounce mechanism.
- 🧱 **Column listing UI pattern**: Automatically animates updated rows to the top—ideal for chat or feed-style interfaces.
- ⚡ **Next.js-ready**: Works out of the box with Server and Client Components.

---

## 🔍 What does it look like?

```tsx
//  Server Component (module-1)
import { WithPopup } from 'next-client-utils';

export default function ServerComponent() {
  return (
    <WithPopup
      PopUp={PopUp}
      popupProps={{}} // Pass `{}` if your popup is typed as React.FC<{}>
      triggerType="hover" // Optional, defaults to "click"
    >
      <div>Open PopUp</div>
    </WithPopup>
  );
}


// Client Component (module-2)
'use client';

const PopUp: React.FC<{}> = () => {
  return <div>This is PopUp</div>; // Style this as needed
};
```

## 🔍 Another Example?


```tsx
// Server Component (module-1)
import { WithPopup } from 'next-client-utils';

export default function ServerComponent() {
  return (
    <WithPopup
      PopUp={ProfileDetailPopUp}
      popupProps={{
        firstName: "Prateek",
        lastName: "Sharma",
      }}
      gap={15} // Optional spacing between trigger and popup
      childrenWrapperComponent={UserName}
    >
      <>SSR Text</>
    </WithPopup>
  );
}


// Client Components (module-2)
'use client';

type ProfileDetailPopUpProps = {
  firstName: string;
  lastName: string;
};

const ProfileDetailPopUp: React.FC<ProfileDetailPopUpProps> = ({ firstName, lastName }) => {
  return <div>This is PopUp</div>; // Use props as needed
};

type UserNameProps = {
  isPopUpActive: boolean; // Provided automatically
  children: React.ReactNode;
};

const UserName: React.FC<UserNameProps> = ({ isPopUpActive, children }) => {
  // Use isPopUpActive to apply dynamic styles
  return <div>{children}</div>; // Receives 'SSR Text' as children
};
```

## 🧠 Example: Rendering a Server Component as a Popup

```tsx
// Server Component (module-1)
import {WithPopup} from 'next-client-utils';

export default function ServerComponent(props: any) {
  // Define server-rendered popup via 'use server' function
  const renderSSRPopUp = async (popupProps: any) => {
    'use server';
    return <AnotherServerComponent {...popupProps} />;
  };

  return (
    <WithPopup
      renderSSRPopUp={renderSSRPopUp}
      popupProps={props} // Pass required props here
      triggerType="hover" // Optional
    >
      <div>Open PopUp</div>
    </WithPopup>
  );
}


// Another Server Component (module-2)

export default function AnotherServerComponent(props: any) {
  // Fetch data or perform server-side logic here
  return <div>This PopUp is server-rendered</div>;
}

```

```bash
npm install next-client-utils
# or
yarn add next-client-utils

```


---

## 🤝 Support

If you face any issues during integration or come across a bug, feel free to reach out to me on [LinkedIn](https://www.linkedin.com/in/prateekpixel) — happy to help!
