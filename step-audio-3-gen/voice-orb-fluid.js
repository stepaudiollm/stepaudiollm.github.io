// Small pressure-projected fluid field. Sound onsets inject travelling density
// rings; advection and dissipation let their refraction settle after each word.
export const createOrbFluid = (gl, makeProgram, buffer) => {
  const half = gl.getExtension('OES_texture_half_float')
  const linear = gl.getExtension('OES_texture_half_float_linear')
  if (!half || !linear) return null
  const targets = []
  const size = 128
  const target = () => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, half.HALF_FLOAT_OES, null)
    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    const result = { texture, framebuffer }
    targets.push(result)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Float targets unavailable')
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return result
  }
  const destroy = () => {
    targets.forEach(({ texture, framebuffer }) => { gl.deleteTexture(texture); gl.deleteFramebuffer(framebuffer) })
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
  try {
    const pair = () => ({ read: target(), write: target(), swap() { [this.read, this.write] = [this.write, this.read] } })
    const velocity = pair(), density = pair(), pressure = pair(), divergence = target()
    const header = `precision highp float; varying vec2 uv;
      uniform sampler2D field; uniform sampler2D aux;
      uniform vec4 sound; uniform vec4 accumulated; uniform float time;
      uniform vec2 direction; const vec2 texel = vec2(1.0 / 128.0);`
    const programs = Object.fromEntries(Object.entries({
      splat: `float dist = length((uv - 0.5) * 1.5);
        float p = mod(dist * 2.0 - time * 0.25 - accumulated.w * 0.15, 1.0);
        float pulse = smoothstep(0.0, 0.15, p) - smoothstep(0.15, 0.3, p);
        vec3 force = vec3(-2.4 * sin(0.5 * accumulated.y), 1.8 * cos(0.38 * accumulated.x), 1.0);
        gl_FragColor = vec4(texture2D(field, uv).rgb + pulse * sound.x * 30.0 * dist * force, 1.0);`,
      divergence: `vec2 l = texture2D(field, uv - vec2(texel.x, 0)).xy;
        vec2 r = texture2D(field, uv + vec2(texel.x, 0)).xy;
        vec2 b = texture2D(field, uv - vec2(0, texel.y)).xy;
        vec2 t = texture2D(field, uv + vec2(0, texel.y)).xy;
        vec2 c = texture2D(field, uv).xy;
        if (uv.x < texel.x) l.x = -c.x; if (uv.x > 1.0 - texel.x) r.x = -c.x;
        if (uv.y < texel.y) b.y = -c.y; if (uv.y > 1.0 - texel.y) t.y = -c.y;
        gl_FragColor = vec4(0.5 * (r.x - l.x + t.y - b.y), 0, 0, 1);`,
      clear: 'gl_FragColor = texture2D(field, uv) * 0.97;',
      pressure: `float l = texture2D(field, uv - vec2(texel.x, 0)).x;
        float r = texture2D(field, uv + vec2(texel.x, 0)).x;
        float b = texture2D(field, uv - vec2(0, texel.y)).x;
        float t = texture2D(field, uv + vec2(0, texel.y)).x;
        gl_FragColor = vec4((l + r + b + t - texture2D(aux, uv).x) * 0.25, 0, 0, 1);`,
      project: `float l = texture2D(aux, uv - vec2(texel.x, 0)).x;
        float r = texture2D(aux, uv + vec2(texel.x, 0)).x;
        float b = texture2D(aux, uv - vec2(0, texel.y)).x;
        float t = texture2D(aux, uv + vec2(0, texel.y)).x;
        gl_FragColor = vec4(texture2D(field, uv).xy - vec2(r - l, t - b), 0, 1);`,
      advect: `vec2 coord = uv - 0.016 * texture2D(aux, uv).xy * texel;
        gl_FragColor = texture2D(field, coord) * 0.98;`,
      blur: `vec2 a = direction * 1.3846153846 * texel;
        vec2 b = direction * 3.2307692308 * texel;
        gl_FragColor = texture2D(field, uv) * 0.2270270270
          + (texture2D(field, uv + a) + texture2D(field, uv - a)) * 0.3162162162
          + (texture2D(field, uv + b) + texture2D(field, uv - b)) * 0.0702702703;`,
    }).map(([name, body]) => {
      const program = makeProgram(`${header} void main() { ${body} }`)
      const uniforms = Object.fromEntries(['field', 'aux', 'sound', 'accumulated', 'time', 'direction'].map(key => [key, gl.getUniformLocation(program, key)]))
      return [name, { program, uniforms }]
    }))
    let time = 0, previous = 0, active = false
    const sound = new Float32Array(4), accumulated = new Float32Array(4)
    const pass = (name, output, field, aux = field, direction = [0, 0]) => {
      const { program, uniforms: u } = programs[name]
      gl.useProgram(program)
      gl.bindFramebuffer(gl.FRAMEBUFFER, output.framebuffer)
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, field.texture)
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, aux.texture)
      gl.uniform1i(u.field, 0); gl.uniform1i(u.aux, 1)
      gl.uniform4fv(u.sound, sound); gl.uniform4fv(u.accumulated, accumulated)
      gl.uniform1f(u.time, time); gl.uniform2fv(u.direction, direction)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return {
      get texture() { return density.read.texture },
      step(delta, bands) {
        time += delta
        for (let i = 0; i < 4; i++) {
          sound[i] += (bands[i] * 2 - sound[i]) * (1 - Math.pow(0.65, delta * 60))
          accumulated[i] += bands[i] * 2 * delta * 15
        }
        active ||= sound[3] > 0.001
        if (!active) return
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.viewport(0, 0, size, size)
        if (sound[3] - previous > 0.0001) {
          pass('splat', velocity.write, velocity.read); velocity.swap()
          pass('splat', density.write, density.read); density.swap()
        }
        previous = sound[3]
        pass('divergence', divergence, velocity.read)
        pass('clear', pressure.write, pressure.read); pressure.swap()
        for (let i = 0; i < 3; i++) { pass('pressure', pressure.write, pressure.read, divergence); pressure.swap() }
        pass('project', velocity.write, velocity.read, pressure.read); velocity.swap()
        pass('advect', velocity.write, velocity.read, velocity.read); velocity.swap()
        pass('advect', density.write, density.read, velocity.read); density.swap()
        pass('blur', density.write, density.read, density.read, [1.2, 0]); density.swap()
        pass('blur', density.write, density.read, density.read, [0, 1.2]); density.swap()
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      },
      destroy,
    }
  } catch {
    destroy()
    return null
  }
}
