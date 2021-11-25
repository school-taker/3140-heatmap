export const l = new Proxy(
	{},
	{
		get(t, key) {
			const element = document.createElement(key);
			return (props, ...children) => {
				for (const [key, value] of Object.entries(props || {})) {
					if (key === 'className') element.className = value;
					else element.setAttribute(key, value);
				}

				for (const child of children) {
					element.append(child);
				}
				return element;
			};
		},
	}
);