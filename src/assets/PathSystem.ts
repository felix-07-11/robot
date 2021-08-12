type ApplicationType =
    | `${'application' | 'text'}/${
          | 'robotscript'
          | 'json'
          | 'javascript'
          | 'typescript'}`
    | `text/${'world'}`
    | 'text/plain';

export function join(...paths: string[]): string {
    let parts: string[] = [];
    // Split the inputs into a list of path commands.
    for (let i = 0, l = paths.length; i < l; i++) {
        parts = parts.concat(paths[i].split('/'));
    }
    // Interpret the path commands to get the new resolved path.
    const newParts = [];
    for (let i = 0, l = parts.length; i < l; i++) {
        const part = parts[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (!part || part === '.') continue;
        // Interpret ".." to pop the last segment
        if (part === '..') newParts.pop();
        // Push new path segments.
        else newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === '') newParts.unshift('');

    // Turn back into a single string path.
    return newParts.join('/') || (newParts.length ? '/' : '.');
}

export default class FileSystem {
    public jsonParsed: FileSystemItem[];
    public readonly root: Directory;

    constructor(
        readonly rootname = '',
        readonly json = '[]',
        private readonly virtual = true,
        private readonly path?: string,
    ) {
        this.jsonParsed = JSON.parse(json);
        this.root = new Directory(rootname);

        if (!this.virtual && this.path === undefined)
            throw 'A no-virtual Filesystem must have an existing path of the Operatingsystem with read & write access.';
    }

    async createFile(
        name: string,
        type: ApplicationType,
        content = '',
        path = '/',
    ): Promise<void> {
        await (await this.getDir(path)).createFile(name, type, content);
    }

    async createDirectory(name: string, path = '/'): Promise<void> {
        await (await this.getDir(path)).createDirectory(name);
    }

    async readFile(
        name: string,
        path = '/',
    ): Promise<{ name: string; type: ApplicationType; content: string }> {
        return { name: '', type: 'application/robotscript', content: '' };
    }

    async writeFile(name: string, path = '/', content = ''): Promise<void> {
        return;
    }

    async rename(name: string, newName: string, path = '/'): Promise<void> {
        return;
    }

    private async getDir(path: string): Promise<Directory> {
        const pathArr = path.split('/');

        return await this.root.get(
            pathArr.pop() as string,
            pathArr == [] ? undefined : pathArr,
        );
    }
}

class FileSystemItem {
    constructor(
        public name: string,
        public type: ApplicationType | 'application/x-directory',
        public path: string,
    ) {}

    // searchPath(name: string, path: string[] = []): string[] {
    //     if (name == this.name) return [...path, this.name];

    //     for (const cc of this.children) {
    //         const result = cc.searchPath(name, [...path, this.name]);
    //         if (result.length !== 0) return result;
    //     }
    //     return [];
    // }

    // search(name: string): FileTreeItem | null {
    //     if (name == this.name) return this;

    //     for (const cc of this.children) {
    //         const result = cc.search(name);
    //         if (result !== null) return result;
    //     }
    //     return null;
    // }

    // createFile(file: FileTreeItem) {
    //     if (this.type !== 'dir') throw `'${this.name}' is no directory`;
    //     this.children.push(file);
    // }

    // deleteFile(name: string) {
    //     if (name == this.name) return true;
    //     this.children.forEach((cc, i) => {
    //         const result = cc.deleteFile(name);
    //         if (result) this.children.splice(i, 1);
    //     });
    //     return false;
    // }

    // static fromJson(json: string) {
    //     const jsonTree = JSON.parse(json);

    //     return new FileTreeItem(
    //         jsonTree.name,
    //         jsonTree.type == 'dir' ? 'dir' : 'file',
    //         FileTreeItem.makeChildren(jsonTree.children),
    //     );
    // }

    // static makeChildren(json: any): FileTreeItem[] {
    //     if (!Array.isArray(json) || json.length === 0) return [];
    //     return json.map(
    //         (val) =>
    //             new FileTreeItem(
    //                 val.name,
    //                 val.type == 'dir' ? 'dir' : 'file',
    //                 FileTreeItem.makeChildren(val.children),
    //             ),
    //     );
    // }
}

class File extends FileSystemItem {
    constructor(
        name: string,
        type: ApplicationType,
        path: string,
        public content = '',
    ) {
        super(name, type, path);
    }
}

class Directory extends FileSystemItem {
    constructor(
        name: string,
        path = '',
        private childnotes: FileSystemItem[] = [],
    ) {
        super(name, 'application/x-directory', path);
    }

    async get(name: string, path?: string[]): Promise<Directory>;
    async get(
        name: string,
        path?: string[],
        type?: ApplicationType,
    ): Promise<File>;
    async get(
        name: string,
        path?: string[],
        type:
            | ApplicationType
            | 'application/x-directory' = 'application/x-directory',
    ): Promise<File | Directory> {
        if (name === '') return this;

        const query = this.childnotes.filter((val) => val.name == name)[0];
        if (!query)
            throw new FileSystemError(
                `File / Directory '${name}' does not exist`,
            );

        // If Directory is searched
        if (type === 'application/x-directory') {
            if (query.type !== 'application/x-directory')
                throw new FileSystemError(`'${name}' is not a directory`);
            if (!path || path === undefined) return query as Directory;
            return await (query as Directory).get(
                path.pop() as string,
                path == [] ? undefined : path,
            );
        }
        // If file is searched
        if (query.type !== type)
            throw new FileSystemError(`'${name}' is not a file of '${type}'`);
        if (!path || path === undefined) return query as File;
        return await (query as Directory).get(
            path.pop() as string,
            path == [] ? undefined : path,
            type,
        );
    }

    async createFile(
        name: string,
        type: ApplicationType,
        content = '',
    ): Promise<void> {
        this.childnotes.push(
            new File(name, type, join(this.path, name), content),
        );
    }

    async createDirectory(name: string): Promise<void> {
        this.childnotes.push(new Directory(name, join(this.path, name)));
    }
}

class FileSystemError extends Error {
    constructor(name = '', message = '') {
        super();
        this.name = name;
        this.message = message;
    }
}
