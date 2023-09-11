import type { Image, Link } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

/**
 * We want to be able to validate resources that links, images and other tags
 * reference. 
 * 
 * TODO: need to implement this function, with unit tests
 * 
 * @returns a remark plugin function which validates URLs
 */
export function remarkValidateResources() {
	return function remarkContentRelImageError() {
		return async (tree: any, vfile: VFile) => {
			if (typeof vfile?.path !== 'string') return;

			visit(tree, (node: Image | Link) => {
				switch (node.type) {
					case 'image':
						// TODO: implement
						break;

					case 'link':
						// TODO: implement
						break;
				}
			});
		};
	};
}
