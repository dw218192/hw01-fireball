in vec4 vs_Pos;
in vec2 vs_UV;

out vec4 fs_Pos;
out vec2 fs_UV;

void main() {
    gl_Position = vec4(vs_Pos.xy, u_NDCDepth, 1.0);

    fs_Pos = vs_Pos;
    fs_UV = vs_UV;
}