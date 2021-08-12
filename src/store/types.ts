export interface Settings {
    mode: 'simple' | 'module' | 'teacher';
}

export class FileTreeItem {
    constructor(
        public name: string,
        public type: 'dir' | 'file' = 'file',
        public children: FileTreeItem[] = [],
    ) {}

    searchPath(name: string, path: string[] = []): string[] {
        if (name == this.name) return [...path, this.name];

        for (const cc of this.children) {
            const result = cc.searchPath(name, [...path, this.name]);
            if (result.length !== 0) return result;
        }
        return [];
    }

    search(name: string): FileTreeItem | null {
        if (name == this.name) return this;

        for (const cc of this.children) {
            const result = cc.search(name);
            if (result !== null) return result;
        }
        return null;
    }

    createFile(file: FileTreeItem) {
        if (this.type !== 'dir') throw `'${this.name}' is no directory`;
        this.children.push(file);
    }

    deleteFile(name: string) {
        if (name == this.name) return true;
        this.children.forEach((cc, i) => {
            const result = cc.deleteFile(name);
            if (result) this.children.splice(i, 1);
        });
        return false;
    }

    static fromJson(json: string) {
        const jsonTree = JSON.parse(json);

        return new FileTreeItem(
            jsonTree.name,
            jsonTree.type == 'dir' ? 'dir' : 'file',
            FileTreeItem.makeChildren(jsonTree.children),
        );
    }

    static makeChildren(json: any): FileTreeItem[] {
        if (!Array.isArray(json) || json.length === 0) return [];
        return json.map(
            (val) =>
                new FileTreeItem(
                    val.name,
                    val.type == 'dir' ? 'dir' : 'file',
                    FileTreeItem.makeChildren(val.children),
                ),
        );
    }
}
